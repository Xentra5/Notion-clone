import os
import re
import json
import threading
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── Load Environment Variables ───────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    parent_dir = os.path.dirname(os.path.dirname(__file__))
    load_dotenv(os.path.join(parent_dir, ".env.local"))
    load_dotenv(os.path.join(parent_dir, ".env"))
    load_dotenv()
except Exception:
    pass

# ─── LangChain Warnings Suppression ──────────────────────────────────────────
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning, module="langchain")
warnings.filterwarnings("ignore", message=".*langchain.*", category=DeprecationWarning)

app = FastAPI(title="Notion RAG AI Microservice")

# ─── CORS: Locked to Next.js origin only ─────────────────────────────────────
# SECURITY: wildcard allow_origins=["*"] with allow_credentials=True was removed.
# It allowed any browser origin to make credentialed cross-origin requests.
# We now restrict to the specific Next.js server origin.
_NEXTJS_ORIGIN = os.getenv("NEXTAUTH_URL", "http://localhost:3000").rstrip("/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[_NEXTJS_ORIGIN],
    allow_credentials=True,
    allow_methods=["POST", "GET", "DELETE"],
    allow_headers=["Content-Type", "X-Rag-Internal-Secret", "X-Workspace-Id"],
)

# ─── Internal Service-to-Service Authentication ───────────────────────────────
# SECURITY: All API endpoints are now protected by a shared secret.
# Next.js sets this in process.env.RAG_INTERNAL_SECRET and passes it as
# the X-Rag-Internal-Secret header on every request to this service.
# The Python service reads it from its own environment.
# If the header is missing or wrong, the request is rejected with 403.
_RAG_INTERNAL_SECRET = os.getenv("RAG_INTERNAL_SECRET", "")

def _verify_internal_secret(x_rag_internal_secret: Optional[str] = Header(None, alias="X-Rag-Internal-Secret")):
    """
    FastAPI dependency — call as Depends(_verify_internal_secret) on protected routes.
    Rejects requests that do not carry the correct shared internal secret.
    Also works even when RAG_INTERNAL_SECRET is not set (development mode — logs a warning).
    """
    if not _RAG_INTERNAL_SECRET:
        # Secret not configured — running in dev mode without a secret; allow but warn.
        import sys
        print(
            "[RAG Security WARNING] RAG_INTERNAL_SECRET is not set. "
            "All requests are accepted. Set this variable in production.",
            file=sys.stderr
        )
        return
    if x_rag_internal_secret != _RAG_INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden: invalid internal secret")


def _resolve_workspace_id(x_workspace_id: Optional[str], body_workspace_id: str) -> str:
    """
    SECURITY: When the X-Workspace-Id header is present (set by Next.js after
    verifying the user session), it takes precedence over the workspaceId field
    in the request body. This prevents an authenticated user from accessing
    another user's vector index by spoofing the workspaceId field.
    """
    if x_workspace_id and x_workspace_id.strip():
        return x_workspace_id.strip()
    return body_workspace_id

# Global mutex lock to ensure SQLite write serialization
db_lock = threading.Lock()

# ─── Lazy Vector Store Setup ───────────────────────────────────────────────────
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
os.makedirs(CHROMA_DIR, exist_ok=True)

_embedding_model = None
_vector_store = None

def get_vector_store():
    global _embedding_model, _vector_store
    if _vector_store is None:
        with db_lock:
            if _vector_store is None:
                print("[RAG] 🧠 Loading SentenceTransformer embedding model (all-MiniLM-L6-v2) on demand...")
                from langchain_community.embeddings import HuggingFaceEmbeddings
                from langchain_community.vectorstores import Chroma
                _embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                _vector_store = Chroma(
                    collection_name="notion_workspace",
                    embedding_function=_embedding_model,
                    persist_directory=CHROMA_DIR,
                )
                print("[RAG] ✅ ChromaDB vector store initialized.")
    return _vector_store

class LazyVectorStore:
    """Proxy object that defers expensive PyTorch/ChromaDB initialization until first real query."""
    def __getattr__(self, name):
        return getattr(get_vector_store(), name)

vector_store = LazyVectorStore()


# ─── Helper Functions ─────────────────────────────────────────────────────────
def _build_chroma_filter(workspace_id: str, page_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Constructs a ChromaDB-compliant metadata filter.
    ChromaDB requires the '$and' operator when querying multiple metadata fields.
    """
    if page_id:
        return {
            "$and": [
                {"workspaceId": {"$eq": workspace_id}},
                {"pageId": {"$eq": page_id}}
            ]
        }
    return {"workspaceId": {"$eq": workspace_id}}


# ─── Request Schemas ──────────────────────────────────────────────────────────
class BlockItem(BaseModel):
    id: str
    type: str
    text: Optional[str] = ""

class IndexPageRequest(BaseModel):
    workspaceId: str = "default"
    pageId: str
    title: str
    blocks: List[BlockItem]

class IndexPagesBatchRequest(BaseModel):
    workspaceId: str = "default"
    pages: List[IndexPageRequest]

class DeletePageRequest(BaseModel):
    workspaceId: str = "default"
    pageId: str

class QueryRequest(BaseModel):
    question: str
    workspaceId: str = "default"
    pageId: Optional[str] = None
    geminiApiKey: Optional[str] = None
    history: List[dict] = Field(default_factory=list)

class MeetingSummaryRequest(BaseModel):
    transcript: str
    title: str = "Meeting"
    geminiApiKey: Optional[str] = None

class MeetingSummaryResponse(BaseModel):
    summary: str
    keyDecisions: List[str]
    actionItems: List[str]
    topics: List[str]


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Notion LangChain RAG Microservice"}


# ─── Index Page ───────────────────────────────────────────────────────────────
from fastapi import Depends

@app.post("/index-page", dependencies=[Depends(_verify_internal_secret)])
def index_page(req: IndexPageRequest, x_workspace_id: Optional[str] = Header(None, alias="X-Workspace-Id")):
    """Chunk page text and upsert into ChromaDB with SQLite lock protection."""
    req.workspaceId = _resolve_workspace_id(x_workspace_id, req.workspaceId)
    try:
        parts = []
        for b in req.blocks:
            if b.text and b.text.strip():
                parts.append(f"[{b.type.upper()}] {b.text.strip()}")
        if not parts:
            return {"status": "skipped", "message": "No text content"}
        combined = f"Page Title: {req.title}\n" + "\n".join(parts)

        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=80)
        chunks = splitter.split_text(combined)

        delete_filter = _build_chroma_filter(req.workspaceId, req.pageId)
        metas = [{"workspaceId": req.workspaceId, "pageId": req.pageId, "title": req.title, "chunkIndex": i} for i in range(len(chunks))]
        ids   = [f"{req.pageId}-chunk-{i}" for i in range(len(chunks))]

        with db_lock:
            try:
                vector_store.delete(where=delete_filter)
            except Exception as del_err:
                print(f"[index-page delete warning] {del_err}")

            vector_store.add_texts(texts=chunks, metadatas=metas, ids=ids)

        return {"status": "success", "indexed_chunks": len(chunks), "pageId": req.pageId}
    except Exception as e:
        print(f"[index-page error] {e}")
        return {"status": "error", "message": str(e)}


# ─── Batch Index Pages ────────────────────────────────────────────────────────
@app.post("/index-pages-batch", dependencies=[Depends(_verify_internal_secret)])
def index_pages_batch(req: IndexPagesBatchRequest, x_workspace_id: Optional[str] = Header(None, alias="X-Workspace-Id")):
    """Batch index multiple workspace pages sequentially under lock."""
    req.workspaceId = _resolve_workspace_id(x_workspace_id, req.workspaceId)
    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=80)
        indexed_count = 0

        with db_lock:
            for p in req.pages:
                try:
                    parts = []
                    for b in p.blocks:
                        if b.text and b.text.strip():
                            parts.append(f"[{b.type.upper()}] {b.text.strip()}")
                    if not parts:
                        continue
                    combined = f"Page Title: {p.title}\n" + "\n".join(parts)
                    chunks = splitter.split_text(combined)

                    delete_filter = _build_chroma_filter(req.workspaceId, p.pageId)
                    try:
                        vector_store.delete(where=delete_filter)
                    except Exception:
                        pass

                    metas = [{"workspaceId": req.workspaceId, "pageId": p.pageId, "title": p.title, "chunkIndex": i} for i in range(len(chunks))]
                    ids = [f"{p.pageId}-chunk-{i}" for i in range(len(chunks))]
                    vector_store.add_texts(texts=chunks, metadatas=metas, ids=ids)
                    indexed_count += 1
                except Exception as pe:
                    print(f"[batch-index page error {p.pageId}] {pe}")

        return {"status": "success", "indexed_pages": indexed_count}
    except Exception as e:
        print(f"[index-pages-batch error] {e}")
        return {"status": "error", "message": str(e)}


# ─── Delete Page Endpoint ─────────────────────────────────────────────────────
@app.delete("/delete-page", dependencies=[Depends(_verify_internal_secret)])
@app.post("/delete-page", dependencies=[Depends(_verify_internal_secret)])
def delete_page(req: DeletePageRequest, x_workspace_id: Optional[str] = Header(None, alias="X-Workspace-Id")):
    """Remove all indexed chunks for a deleted or trashed page."""
    req.workspaceId = _resolve_workspace_id(x_workspace_id, req.workspaceId)
    try:
        delete_filter = _build_chroma_filter(req.workspaceId, req.pageId)
        with db_lock:
            vector_store.delete(where=delete_filter)
        return {"status": "success", "message": f"Deleted page {req.pageId} from vector store"}
    except Exception as e:
        print(f"[delete-page error] {e}")
        return {"status": "error", "message": str(e)}


# ─── Query ────────────────────────────────────────────────────────────────────
@app.post("/query", dependencies=[Depends(_verify_internal_secret)])
def query_rag(req: QueryRequest, x_workspace_id: Optional[str] = Header(None, alias="X-Workspace-Id")):
    q = req.question.strip()
    req.workspaceId = _resolve_workspace_id(x_workspace_id, req.workspaceId)
    # SECURITY: geminiApiKey from request body is ignored; use own env variable
    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip().strip('"').strip("'")

    if not q:
        return {"answer": "Please ask a question or type `/summary` or `/search <query>`.", "citations": []}

    # Cap question length to prevent prompt-flooding attacks
    if len(q) > 4000:
        return {"answer": "Question too long (max 4000 characters).", "citations": []}

    # 1. /search command — live web search via built-in LangChain DuckDuckGo tools

    if q.lower().startswith("/search") or q.lower().startswith("search ") or q.lower().startswith("find "):
        search_q = re.sub(r"^(/search|search|find)\s*", "", q, flags=re.I).strip()
        if not search_q:
            return {"answer": "Please provide a search query. Example: `/search Next.js 16 features`", "citations": []}

        import datetime
        now = datetime.datetime.now()
        current_date_str = now.strftime("%A, %B %d, %Y")

        # Live search using LangChain DuckDuckGo Search Wrapper
        search_results_list = []
        raw_snippet_text = ""
        try:
            from langchain_community.utilities import DuckDuckGoSearchAPIWrapper
            from langchain_community.tools import DuckDuckGoSearchResults, DuckDuckGoSearchRun

            ddg_wrapper = DuckDuckGoSearchAPIWrapper(max_results=5)
            ddg_tool = DuckDuckGoSearchResults(api_wrapper=ddg_wrapper, output_format="list")
            raw_res = ddg_tool.invoke(search_q)

            if isinstance(raw_res, list) and len(raw_res) > 0:
                for item in raw_res:
                    if isinstance(item, dict):
                        title = item.get("title", "").strip()
                        link = item.get("link", "").strip()
                        snippet = item.get("snippet", "").strip()
                        if title or snippet:
                            search_results_list.append({"title": title or "Web Result", "link": link, "snippet": snippet})

            if not search_results_list:
                # Fallback to standard DuckDuckGoSearchRun
                search_run = DuckDuckGoSearchRun(api_wrapper=ddg_wrapper)
                raw_snippet_text = search_run.invoke(search_q)
        except Exception as ddg_err:
            print(f"[LangChain DuckDuckGo error] {ddg_err}")

        # Check for date / time query
        is_date_q = bool(re.search(r"(today'?s\s+date|what\s+is\s+today|current\s+date)", search_q, re.I))
        if is_date_q:
            return {
                "answer": f"🌐 **Web Search: \"{search_q}\"**\n\n### Today's Date\nToday is **{current_date_str}**.\n\n*Verified with system time & real-time search.*",
                "citations": [],
                "source": "web_search",
            }

        # Build formatted list of live search results
        formatted_list = ""
        if search_results_list:
            formatted_list = "\n\n".join(
                f"**{i+1}. [{r['title']}]({r['link']})**\n{r['snippet']}\n🔗 [{r['link']}]({r['link']})"
                if r['link'] else f"**{i+1}. {r['title']}**\n{r['snippet']}"
                for i, r in enumerate(search_results_list)
            )
        elif raw_snippet_text:
            formatted_list = raw_snippet_text

        # If LLM is available, synthesize with LangChain using real-time search context & current date
        clean_key = (api_key or os.getenv("GEMINI_API_KEY") or "").strip().strip('"').strip("'")
        if clean_key and len(clean_key) > 20 and not clean_key.startswith("your-") and formatted_list:
            try:
                web_ctx = f"Today's real-world date: {current_date_str}\n\nLive DuckDuckGo Web Results:\n{formatted_list}"
                answer = _llm(
                    system=f"""You are Notion AI, an expert web search assistant.
Current Date: {current_date_str}.
Instructions:
- Provide an accurate, comprehensive answer grounded in the live LangChain DuckDuckGo search results provided in the context.
- Format your response with clear markdown headings (##, ###), structured paragraphs, bullet points, and facts.
- Include source links where relevant.
- NEVER cite an outdated year (like 2024 or earlier) for current/recent events when today's date is {current_date_str}.
- Directly deliver the informative, structured answer without conversational preamble.""",
                    context=web_ctx,
                    user_query=search_q,
                    api_key=api_key,
                    history=req.history,
                )
                if answer and not answer.startswith("## ") and not "To unlock live AI writing" in answer:
                    return {
                        "answer": f"🌐 **Web Search: \"{search_q}\"**\n\n{answer}",
                        "citations": [],
                        "source": "web_search",
                    }
            except Exception as llm_err:
                print(f"[LLM search synthesis error] {llm_err}")

        # Return live DuckDuckGo results directly
        if formatted_list:
            return {
                "answer": f"🌐 **LangChain DuckDuckGo Live Search: \"{search_q}\"**\n\n{formatted_list}",
                "citations": [],
                "source": "langchain_duckduckgo",
            }

        return {
            "answer": f"🌐 **Web Search: \"{search_q}\"**\n\nNo live search results found on DuckDuckGo. Try refining your keywords.",
            "citations": [],
            "source": "web_search",
        }

    # 2. /write command: generate structured Notion blocks to append directly to page
    if q.lower().startswith("/write") or q.lower().startswith("write ") or q.lower().startswith("draft "):
        instruction = re.sub(r"^(/write|write|draft)\s*", "", q, flags=re.I).strip()
        if not instruction:
            return {
                "answer": "Tell me what to write after `/write`, for example: `/write Explain Large Language Models`.",
                "citations": [],
                "source": "write_help",
            }
        content = _llm(
            system="""You are Notion AI, an expert workspace writer.
Format the content cleanly using standard Notion markdown blocks:
- Use ## for Section Headings (Heading 2) and ### for Subheadings (Heading 3).
- Use regular paragraphs for narrative explanations.
- Use - for bullet points when listing features, benefits, concepts, or examples.
- Use 1. for sequential steps or ordered workflows.
- Use ```language ... ``` for any code blocks.
- Use > for quotes, callouts, or key takeaways.
- Use --- for section dividers where appropriate.
- Understand the user's intent even if the prompt has typos or grammatical errors. Never comment on spelling, typos, or grammar.
- Do NOT output preamble, conversational filler, or greetings (do NOT say "Here is...", "Sure!", etc.).
- Output ONLY the formatted document content ready to be placed on the page.""",
            context="",
            user_query=instruction,
            api_key=api_key,
            history=req.history,
        )
        return {
            "answer": f"✍️ **Content ready to write**\n\n{content}",
            "citations": [],
            "source": "agent_write",
            "action": "append_block",
            "blockType": "paragraph",
            "content": content,
        }

    # 3. /code command: generate formatted code block
    if q.lower().startswith("/code") or q.lower().startswith("code "):
        instruction = re.sub(r"^(/code|code)\s*", "", q, flags=re.I).strip()
        if not instruction:
            return {
                "answer": "Tell me what code to create after `/code`, for example: `/code React button with loading state`.",
                "citations": [],
                "source": "code_help",
            }
        answer = _llm(
            system="""You are an expert programming assistant.
Provide a concise explanation and a complete, well-formatted code block wrapped in ```language ... ```.
Understand the user's intent even if their query has misspellings or informal phrasing.
Never comment on typos or grammar.""",
            context="",
            user_query=instruction,
            api_key=api_key,
            history=req.history,
        )
        # Extract code snippet and language
        lang_match = re.search(r"```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```", answer)
        code_content = lang_match.group(2).strip() if lang_match else answer
        code_lang = lang_match.group(1).strip() if lang_match and lang_match.group(1) else "code"

        return {
            "answer": answer,
            "citations": [],
            "source": "code",
            "action": "append_block",
            "blockType": "code",
            "content": code_content,
            "language": code_lang,
        }

    # 4. Vector similarity search with ChromaDB-compliant filter
    search_filter = _build_chroma_filter(req.workspaceId, req.pageId)
    search_results = []
    try:
        search_results = vector_store.similarity_search_with_score(q, k=4, filter=search_filter)
    except Exception as search_err:
        print(f"[Chroma similarity_search error] {search_err}")

    relevant, citations_set, citations = [], set(), []
    for doc, score in search_results:
        # Distance score threshold (accept relevant matches)
        if score < 1.35:
            pid   = doc.metadata.get("pageId", "")
            title = doc.metadata.get("title", "Untitled")
            relevant.append(f"[{title}]: {doc.page_content}")
            if pid and pid not in citations_set:
                citations_set.add(pid)
                citations.append({"pageId": pid, "title": title})

    context = "\n\n".join(relevant) if relevant else ""

    # 5. /action-items command: extract todos / tasks
    if q.lower().startswith("/action-items") or q.lower().startswith("/todo"):
        if not relevant:
            return {
                "answer": "⚠️ No notes found in your current workspace to extract action items from.",
                "citations": [],
            }
        answer = _llm(
            system="You are Notion AI. Extract concrete action items, todos, and deliverables from the provided workspace context. Format each item as a markdown checkbox (- [ ] Task description with owner if mentioned).",
            context=context,
            user_query="Extract all action items and tasks.",
            api_key=api_key,
            history=req.history,
        )
        return {"answer": f"📋 **Action Items & Deliverables**\n\n{answer}", "citations": citations, "source": "action_items"}

    # 6. /translate command: translate context or text
    if q.lower().startswith("/translate"):
        instruction = q[10:].strip()
        if not instruction:
            return {"answer": "Specify the target language after `/translate`, for example: `/translate into Spanish`.", "citations": []}
        answer = _llm(
            system="You are a professional translator. Translate the text accurately while preserving tone, formatting, and markdown structures.",
            context=context,
            user_query=f"Translate: {instruction}",
            api_key=api_key,
            history=req.history,
        )
        return {"answer": answer, "citations": citations, "source": "translation"}

    # 7. /summary / /summery command
    if (
        q.lower().startswith("/summary")
        or q.lower().startswith("/summery")
        or q.lower().startswith("/sum")
        or q.lower().startswith("/tldr")
        or q.lower().startswith("summarize")
        or q.lower().startswith("summary")
        or q.lower().startswith("summery")
    ):
        if not relevant:
            return {
                "answer": "⚠️ I don't have enough context in your workspace pages to generate a summary. Add some text blocks to your pages first, or use `/search <query>` to search the web.",
                "citations": [],
            }
        answer  = _llm(
            system="You are Notion AI. Write a structured executive summary with headings: Key Takeaways, Key Decisions, and Action Items. Use ONLY the provided context.",
            context=context,
            user_query="Summarize this workspace content.",
            api_key=api_key,
            history=req.history,
        )
        return {"answer": f"📝 **Workspace Executive Summary**\n\n{answer}", "citations": citations}

    # 8. Conversational Q&A (workspace grounded or general knowledge fallback)
    if relevant:
        answer = _llm(
            system="You are Notion AI, a workspace assistant. Answer the question using the provided workspace context below with clarity and precision.",
            context=context,
            user_query=q,
            api_key=api_key,
            history=req.history,
        )
        return {"answer": answer, "citations": citations, "source": "workspace_rag"}

    # General knowledge fallback with LangChain
    answer = _llm(
        system="""You are Notion AI, an intelligent workspace assistant.
Provide a clear, thorough, and well-structured answer to the user's question.
Format your response with clear markdown headings, paragraphs, bullet points, or code snippets where appropriate.
Understand the user's intent even if their query contains typos or broken grammar.
Never comment on spelling, typos, or grammar in your response.""",
        context="",
        user_query=q,
        api_key=api_key,
        history=req.history,
    )
    return {
        "answer": f"{answer}\n\n*(Answered with Notion AI general knowledge. Try `/search` for live web search or `/write` to add directly to this page.)*",
        "citations": [],
        "source": "general_ai",
    }


# ─── LLM Helper ───────────────────────────────────────────────────────────────
def _llm(system: str, context: str, user_query: str, api_key: Optional[str], history: Optional[List[dict]] = None) -> str:
    clean_key = (api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip().strip('"').strip("'")
    if clean_key and not clean_key.startswith("your-") and len(clean_key) > 10:
        from langchain_google_genai import ChatGoogleGenerativeAI
        models_to_try = [
            os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.5-flash",
        ]
        prior_turns = "\n".join(
            f"{turn.get('role', 'user').title()}: {str(turn.get('text', ''))[:4000]}"
            for turn in (history or [])[-12:]
        )
        robust_system = f"{system}\nUnderstand the user's intent even if the prompt has typos or grammatical errors. Never comment on spelling, typos, or grammar in your response."
        prompt = f"{robust_system}\n\nPrevious conversation:\n{prior_turns or '(none)'}\n\nWorkspace Context:\n{context}\n\nUser Question: {user_query}"

        for m in models_to_try:
            try:
                llm = ChatGoogleGenerativeAI(
                    model=m,
                    google_api_key=clean_key,
                    max_output_tokens=4096,
                    temperature=0.7,
                )
                res = llm.invoke(prompt)
                if res and res.content:
                    return str(res.content)
            except Exception as e:
                print(f"[Gemini model {m} error] {e}")

    # Fallback: synthesise directly from context chunks when LLM fails or API key is absent
    lines = [c.split("]: ", 1)[-1].strip() for c in context.split("\n\n") if "]: " in c]
    if lines:
        return "Based on your workspace notes:\n\n" + "\n".join(f"• {l}" for l in lines[:5])
    return f"## {user_query.strip().title()}\n\n*(Note: To unlock live AI writing, make sure a valid Google Gemini API key is configured in `.env`.)*"


# ─── Meeting Summary ──────────────────────────────────────────────────────────
@app.post("/meeting-summary", response_model=MeetingSummaryResponse, dependencies=[Depends(_verify_internal_secret)])
def meeting_summary(req: MeetingSummaryRequest):
    """
    Takes a raw meeting transcript and returns a structured AI-generated summary.
    Uses Gemini via LangChain — reads GEMINI_API_KEY from its own environment.
    """
    # SECURITY: geminiApiKey from request body is ignored; read from own env
    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
    transcript = req.transcript.strip()
    if not transcript:
        return MeetingSummaryResponse(
            summary="No transcript was provided.",
            keyDecisions=[],
            actionItems=[],
            topics=[],
        )

    SYSTEM = """You are an expert meeting note-taker. Given the raw transcript of a meeting, output EXACTLY the following JSON structure (no markdown, no code fences, just raw JSON):
{
  "summary": "<2-4 sentence plain-english summary of the full meeting>",
  "keyDecisions": ["<decision 1>", "<decision 2>"],
  "actionItems": ["<action item 1>", "<action item 2>"],
  "topics": ["<topic 1>", "<topic 2>", "<topic 3>"]
}

Rules:
- summary: concise, no filler. Describe what was discussed and concluded.
- keyDecisions: concrete decisions that were made. Max 5.
- actionItems: tasks someone needs to do. Include owner if mentioned. Max 6.
- topics: short keyword labels for subjects covered. Max 6.
- If a section has nothing, return an empty array [].
- ONLY output valid JSON. No explanation before or after."""

    if api_key and api_key.strip():

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key.strip(),
            )
            prompt = f"{SYSTEM}\n\nMeeting Title: {req.title}\n\nFull Transcript:\n{transcript}"
            res = llm.invoke(prompt)
            raw = str(res.content) if res and res.content else ""
            # Robust JSON extraction handling fences or raw text
            json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
            if json_match:
                raw_json = json_match.group(1)
            else:
                bare_match = re.search(r"(\{.*\})", raw, re.DOTALL)
                raw_json = bare_match.group(1) if bare_match else raw

            parsed = json.loads(raw_json)
            return MeetingSummaryResponse(
                summary=parsed.get("summary", ""),
                keyDecisions=parsed.get("keyDecisions", []) if isinstance(parsed.get("keyDecisions"), list) else [],
                actionItems=parsed.get("actionItems", []) if isinstance(parsed.get("actionItems"), list) else [],
                topics=parsed.get("topics", []) if isinstance(parsed.get("topics"), list) else [],
            )
        except Exception as e:
            print(f"[meeting-summary Gemini error] {e}")

    # ── Fallback: naive parse without LLM ────────────────────────────────────
    lines = [l.strip() for l in transcript.split("\n") if l.strip()]
    words = transcript.split()
    summary = " ".join(words[:60]) + ("…" if len(words) > 60 else "")
    return MeetingSummaryResponse(
        summary=f"Meeting transcript captured ({len(lines)} entries). {summary}",
        keyDecisions=["Review transcript and add decisions manually."],
        actionItems=["Review the transcript in the Live Transcript tab."],
        topics=["Meeting recording"],
    )


# ─── AI Agent ─────────────────────────────────────────────────────────────────

class AgentRequest(BaseModel):
    message: str
    sessionToken: Optional[str] = ""          # forwarded session cookie value from Next.js (optional)
    nextjsBaseUrl: str                        # e.g. http://localhost:3000
    workspaceId: str                          # user email used as workspace id
    geminiApiKey: Optional[str] = None
    history: List[dict] = Field(default_factory=list)
    persona: Optional[str] = "project_hr"
    personaCustomPrompt: Optional[str] = None
    memories: List[str] = Field(default_factory=list)
    currentDate: Optional[str] = None

class AgentToolCall(BaseModel):
    tool: str
    input: str
    output: str

class AgentResponse(BaseModel):
    answer: str
    toolCalls: List[AgentToolCall] = Field(default_factory=list)
    action: Optional[str] = None
    blockType: Optional[str] = None
    content: Optional[str] = None


def _make_nextjs_headers(session_token: Optional[str] = "", workspace_id: str = "") -> dict:
    """Build headers with the session cookie so Next.js API routes authenticate the agent."""
    headers = {
        "Content-Type": "application/json",
    }
    if session_token:
        if ";" in session_token or "=" in session_token:
            cookie_val = session_token
        else:
            cookie_val = (
                f"next-auth.session-token={session_token}; "
                f"__Secure-next-auth.session-token={session_token}"
            )
        headers["Cookie"] = cookie_val
    if _RAG_INTERNAL_SECRET:
        headers["X-Rag-Internal-Secret"] = _RAG_INTERNAL_SECRET
    if workspace_id:
        headers["X-Workspace-Id"] = workspace_id
    return headers


def _markdown_to_blocks(content: str) -> list:
    """Convert markdown text into rich Notion blocks (heading1, heading2, heading3, heading4, bullets, numbered, todos, quotes, callouts, code, dividers, tables, paragraphs)."""
    blocks = []
    if not content or not content.strip():
        return blocks

    lines = content.strip().split("\n")
    in_code_block = False
    code_lines = []
    code_lang = "javascript"

    in_table = False
    table_lines = []

    def flush_table():
        nonlocal in_table, table_lines
        if not table_lines:
            in_table = False
            return
        parsed_rows = []
        for tl in table_lines:
            stripped_tl = tl.strip()
            # Skip separator rows like |---|---|
            if re.match(r"^\|(\s*:?-+:?\s*\|)+$", stripped_tl):
                continue
            cells = [c.strip() for c in stripped_tl.strip("|").split("|")]
            if any(cells):
                parsed_rows.append(cells)
        if parsed_rows:
            max_cols = max(len(r) for r in parsed_rows)
            normalized = [r + [""] * (max_cols - len(r)) for r in parsed_rows]
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "table",
                "properties": {
                    "text": "",
                    "tableData": normalized,
                },
            })
        in_table = False
        table_lines = []

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()

        if stripped.startswith("```"):
            if in_table:
                flush_table()
            if in_code_block:
                blocks.append({
                    "id": f"agent-block-{len(blocks)}",
                    "type": "code",
                    "properties": {
                        "text": "\n".join(code_lines),
                        "language": code_lang or "javascript",
                    },
                })
                in_code_block = False
                code_lines = []
            else:
                in_code_block = True
                code_lang = stripped[3:].strip() or "javascript"
            continue

        if in_code_block:
            code_lines.append(line)
            continue

        # Table row detection
        if stripped.startswith("|") and stripped.endswith("|") and stripped.count("|") >= 2:
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            flush_table()

        if not stripped:
            continue

        if stripped.startswith("#### "):
            text_val = stripped[5:].strip()
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "heading4",
                "properties": {"text": text_val, "title": text_val},
            })
        elif stripped.startswith("### "):
            text_val = stripped[4:].strip()
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "heading3",
                "properties": {"text": text_val, "title": text_val},
            })
        elif stripped.startswith("## "):
            text_val = stripped[3:].strip()
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "heading2",
                "properties": {"text": text_val, "title": text_val},
            })
        elif stripped.startswith("# "):
            text_val = stripped[2:].strip()
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "heading1",
                "properties": {"text": text_val, "title": text_val},
            })
        elif stripped.startswith("- [ ] ") or stripped.startswith("* [ ] "):
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "todo",
                "properties": {"text": stripped[6:].strip(), "checked": False},
            })
        elif stripped.startswith("- [x] ") or stripped.startswith("* [x] ") or stripped.startswith("- [X] "):
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "todo",
                "properties": {"text": stripped[6:].strip(), "checked": True},
            })
        elif stripped.startswith("- ") or stripped.startswith("* ") or stripped.startswith("+ ") or stripped.startswith("• "):
            text_val = re.sub(r"^[-*+•]\s+", "", stripped).strip()
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "bullet",
                "properties": {"text": text_val},
            })
        elif re.match(r"^\d+[\.\)]\s", stripped):
            # Numbered / ordered list item (e.g. "1. First item" or "1) First item")
            text_val = re.sub(r"^\d+[\.\)]\s*", "", stripped).strip()
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "numbered",
                "properties": {"text": text_val},
            })
        elif stripped.startswith("> [!NOTE]") or stripped.startswith("> [!TIP]") or stripped.startswith("> [!IMPORTANT]") or stripped.startswith("> [!WARNING]") or stripped.startswith("> [!CAUTION]") or stripped.startswith("> 💡") or stripped.startswith("💡 "):
            callout_text = re.sub(r"^(>\s*\[![A-Z]+\]\s*|>\s*💡\s*|💡\s*)", "", stripped).strip()
            icon = "💡"
            if "NOTE" in stripped or "IMPORTANT" in stripped:
                icon = "📌"
            elif "WARNING" in stripped or "CAUTION" in stripped:
                icon = "⚠️"
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "callout",
                "properties": {"text": callout_text, "calloutIcon": icon},
            })
        elif stripped.startswith("> "):
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "quote",
                "properties": {"text": stripped[2:].strip()},
            })
        elif stripped in ("---", "***", "___"):
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "divider",
                "properties": {"text": ""},
            })
        else:
            blocks.append({
                "id": f"agent-block-{len(blocks)}",
                "type": "paragraph",
                "properties": {"text": stripped},
            })

    if in_table:
        flush_table()

    if in_code_block and code_lines:
        blocks.append({
            "id": f"agent-block-{len(blocks)}",
            "type": "code",
            "properties": {
                "text": "\n".join(code_lines),
                "language": code_lang or "javascript",
            },
        })

    return blocks


def _build_agent_tools(base_url: str, session_token: Optional[str], workspaceId: str, tool_calls_log: list):
    """
    Returns a list of LangChain @tool functions that make authenticated HTTP calls
    back to the Next.js API routes.
    """
    import requests as req_lib
    from langchain.tools import tool

    headers = _make_nextjs_headers(session_token, workspaceId)

    @tool
    def create_calendar_event(title: str, date: str, start_time: str = "", end_time: str = "",
                               description: str = "", location: str = "", color: str = "blue") -> str:
        """
        Create a new calendar event for the user.
        Args:
            title: Event title (required)
            date: Date in YYYY-MM-DD format (required)
            start_time: Start time in HH:MM 24h format e.g. '14:30' (optional)
            end_time: End time in HH:MM 24h format e.g. '15:30' (optional)
            description: Event description (optional)
            location: Event location (optional)
            color: One of: blue, red, green, yellow, purple, pink, orange, gray (optional)
        Returns:
            Confirmation message with the created event details.
        """
        payload = {
            "title": title,
            "date": date,
            "startTime": start_time,
            "endTime": end_time,
            "description": description,
            "location": location,
            "color": color,
        }
        try:
            r = req_lib.post(f"{base_url}/api/calendar", json=payload, headers=headers, timeout=10)
            if r.status_code in (200, 201):
                event = r.json().get("event", {})
                eid = event.get("_id", "")
                result = f"✅ Calendar event created: '{event.get('title', title)}' on {event.get('date', date)}"
                if event.get("startTime"):
                    result += f" at {event['startTime']}"
                if eid:
                    result += f" (ID: {eid})"
                tool_calls_log.append({"tool": "create_calendar_event", "input": str(payload), "output": result})
                return result
            else:
                err = r.json().get("error", r.text)
                tool_calls_log.append({"tool": "create_calendar_event", "input": str(payload), "output": f"Error: {err}"})
                return f"Failed to create event: {err}"
        except Exception as e:
            tool_calls_log.append({"tool": "create_calendar_event", "input": str(payload), "output": f"Error: {e}"})
            return f"Error creating calendar event: {e}"

    @tool
    def update_calendar_event(event_id: str, title: str = "", date: str = "", start_time: str = "",
                               end_time: str = "", description: str = "", location: str = "", color: str = "") -> str:
        """
        Revise, reschedule, or update an existing calendar event.
        Args:
            event_id: MongoDB ID of the calendar event (required)
            title: New title (optional)
            date: New date in YYYY-MM-DD format (optional)
            start_time: New start time in HH:MM format (optional)
            end_time: New end time in HH:MM format (optional)
            description: New description (optional)
            location: New location (optional)
            color: New color (optional)
        Returns:
            Confirmation of update.
        """
        payload = {}
        if title: payload["title"] = title
        if date: payload["date"] = date
        if start_time: payload["startTime"] = start_time
        if end_time: payload["endTime"] = end_time
        if description: payload["description"] = description
        if location: payload["location"] = location
        if color: payload["color"] = color

        try:
            r = req_lib.patch(f"{base_url}/api/calendar/{event_id}", json=payload, headers=headers, timeout=10)
            if r.status_code == 200:
                event = r.json().get("event", {})
                result = f"✅ Calendar event updated: '{event.get('title', 'Event')}' on {event.get('date', '')} at {event.get('startTime', '')}"
                tool_calls_log.append({"tool": "update_calendar_event", "input": str(payload), "output": result})
                return result
            else:
                err = r.json().get("error", r.text)
                tool_calls_log.append({"tool": "update_calendar_event", "input": str(payload), "output": f"Error: {err}"})
                return f"Failed to update event: {err}"
        except Exception as e:
            tool_calls_log.append({"tool": "update_calendar_event", "input": str(payload), "output": f"Error: {e}"})
            return f"Error updating calendar event: {e}"

    @tool
    def delete_calendar_event(event_id: str) -> str:
        """
        Cancel or delete an existing calendar event.
        Args:
            event_id: MongoDB ID of the calendar event (required)
        Returns:
            Confirmation of deletion.
        """
        try:
            r = req_lib.delete(f"{base_url}/api/calendar/{event_id}", headers=headers, timeout=10)
            if r.status_code == 200:
                result = f"🗑️ Calendar event (ID: {event_id}) successfully deleted."
                tool_calls_log.append({"tool": "delete_calendar_event", "input": event_id, "output": result})
                return result
            else:
                err = r.json().get("error", r.text)
                tool_calls_log.append({"tool": "delete_calendar_event", "input": event_id, "output": f"Error: {err}"})
                return f"Failed to delete event: {err}"
        except Exception as e:
            tool_calls_log.append({"tool": "delete_calendar_event", "input": event_id, "output": f"Error: {e}"})
            return f"Error deleting calendar event: {e}"

    @tool
    def list_calendar_events(limit: int = 10) -> str:
        """
        List upcoming calendar events for the user. Always use this tool to inspect scheduled events or find event IDs for updating/rescheduling.
        Args:
            limit: Max number of events to return (default 10)
        Returns:
            A formatted list of upcoming calendar events with IDs, dates, and times.
        """
        try:
            r = req_lib.get(f"{base_url}/api/calendar", headers=headers, timeout=10)
            if r.status_code == 200:
                events = r.json().get("events", [])[:limit]
                if not events:
                    result = "No calendar events found."
                else:
                    lines = []
                    for e in events:
                        eid = e.get("_id", "")
                        line = f"• [ID: {eid}] {e.get('title', 'Untitled')} — {e.get('date', '')}"
                        if e.get("startTime"):
                            line += f" {e['startTime']}"
                        if e.get("endTime"):
                            line += f"–{e['endTime']}"
                        if e.get("location"):
                            line += f" @ {e['location']}"
                        lines.append(line)
                    result = f"📅 Upcoming events ({len(events)}):\n" + "\n".join(lines)
                tool_calls_log.append({"tool": "list_calendar_events", "input": str(limit), "output": result})
                return result
            else:
                tool_calls_log.append({"tool": "list_calendar_events", "input": str(limit), "output": "Error fetching events"})
                return "Failed to fetch calendar events."
        except Exception as e:
            tool_calls_log.append({"tool": "list_calendar_events", "input": str(limit), "output": f"Error: {e}"})
            return f"Error fetching calendar events: {e}"

    @tool
    def create_page(title: str, content: str = "", category: str = "Private") -> str:
        """
        Create a new rich, detailed page (note or document) in the user's workspace.
        IMPORTANT: The content MUST be comprehensive and well-structured using rich markdown.
        Args:
            title: Page title (required)
            content: REQUIRED. Must be detailed, multi-section markdown content. Include:
                - Multiple `## Heading` and `### Subheading` sections (at least 3-4 sections)
                - Bullet lists (`- item`) for features, benefits, comparisons
                - Numbered lists (`1. step`) for processes or rankings
                - Bold text (`**key term**`) for emphasis
                - Block quotes (`> important note`) for key takeaways
                - Code blocks (```language\ncode\n```) when relevant
                - Horizontal dividers (`---`) between major sections
                - At least 300-500 words of substantive content
                NEVER pass empty or minimal content. Each section must have real, detailed paragraphs.
            category: One of 'Private', 'Shared', 'Meetings' (default: 'Private')
        Returns:
            Confirmation with the new page ID.
        """
        blocks = _markdown_to_blocks(content)
        payload = {
            "title": title,
            "category": category if category in ("Private", "Shared", "Meetings") else "Private",
            "blocks": blocks,
        }
        try:
            r = req_lib.post(f"{base_url}/api/pages", json=payload, headers=headers, timeout=10)
            if r.status_code in (200, 201):
                page = r.json().get("page", {})
                page_id = page.get("_id", "")
                result = f"✅ Page created: '{page.get('title', title)}' (ID: {page_id}) with {len(blocks)} blocks."
                tool_calls_log.append({"tool": "create_page", "input": title, "output": result})
                return result
            else:
                err = r.json().get("error", r.text)
                tool_calls_log.append({"tool": "create_page", "input": title, "output": f"Error: {err}"})
                return f"Failed to create page: {err}"
        except Exception as e:
            tool_calls_log.append({"tool": "create_page", "input": title, "output": f"Error: {e}"})
            return f"Error creating page: {e}"

    @tool
    def update_page(page_id: str, title: str = "", content_to_append: str = "") -> str:
        """
        Revise or append content to an existing workspace page.
        Args:
            page_id: The ID of the page to update (required)
            title: New title for the page (optional)
            content_to_append: Markdown text to append as new blocks (optional)
        Returns:
            Confirmation of page update.
        """
        try:
            get_res = req_lib.get(f"{base_url}/api/pages/{page_id}", headers=headers, timeout=10)
            existing_blocks = []
            current_title = title
            if get_res.status_code == 200:
                p_data = get_res.json().get("page", {})
                existing_blocks = p_data.get("blocks", [])
                if not current_title:
                    current_title = p_data.get("title", "Untitled")

            new_blocks = list(existing_blocks)
            if content_to_append.strip():
                append_blocks = _markdown_to_blocks(content_to_append)
                for b in append_blocks:
                    b["id"] = f"agent-block-{len(new_blocks)}"
                    new_blocks.append(b)

            patch_payload = {
                "title": current_title,
                "blocks": new_blocks,
            }
            r = req_lib.patch(f"{base_url}/api/pages/{page_id}", json=patch_payload, headers=headers, timeout=10)
            if r.status_code == 200:
                result = f"✅ Page '{current_title}' (ID: {page_id}) updated with new content."
                tool_calls_log.append({"tool": "update_page", "input": f"{page_id} - {title}", "output": result})
                return result
            else:
                err = r.json().get("error", r.text)
                tool_calls_log.append({"tool": "update_page", "input": page_id, "output": f"Error: {err}"})
                return f"Failed to update page: {err}"
        except Exception as e:
            tool_calls_log.append({"tool": "update_page", "input": page_id, "output": f"Error: {e}"})
            return f"Error updating page: {e}"

    @tool
    def list_pages(limit: int = 10) -> str:
        """
        List the user's workspace pages.
        Args:
            limit: Max pages to return (default 10)
        Returns:
            A formatted list of workspace pages with IDs.
        """
        try:
            r = req_lib.get(f"{base_url}/api/pages", headers=headers, timeout=10)
            if r.status_code == 200:
                pages = r.json().get("pages", [])[:limit]
                if not pages:
                    result = "No pages found in workspace."
                else:
                    lines = [
                        f"• [ID: {p.get('_id', '')}] {p.get('icon', '📄')} {p.get('title', 'Untitled')} [{p.get('category', '')}]"
                        for p in pages
                    ]
                    result = f"📄 Workspace pages ({len(pages)}):\n" + "\n".join(lines)
                tool_calls_log.append({"tool": "list_pages", "input": str(limit), "output": result})
                return result
            else:
                tool_calls_log.append({"tool": "list_pages", "input": str(limit), "output": "Error fetching pages"})
                return "Failed to fetch pages."
        except Exception as e:
            tool_calls_log.append({"tool": "list_pages", "input": str(limit), "output": f"Error: {e}"})
            return f"Error fetching pages: {e}"

    @tool
    def search_workspace(query: str) -> str:
        """
        Semantic search through the user's workspace notes using ChromaDB RAG (vector similarity).
        Args:
            query: What to search for in the workspace notes
        Returns:
            Relevant excerpts from workspace pages with citations.
        """
        try:
            results = get_vector_store().similarity_search_with_score(
                query, k=5, filter={"workspaceId": {"$eq": workspaceId}}
            )
            relevant = [
                f"[{doc.metadata.get('title', 'Untitled')} (PageID: {doc.metadata.get('pageId', '')})]: {doc.page_content}"
                for doc, score in results if score < 1.45
            ]
            if not relevant:
                result = "No relevant workspace content found for that query in vector store."
            else:
                result = "🔍 Workspace RAG Search Results:\n\n" + "\n\n".join(relevant)
            tool_calls_log.append({"tool": "search_workspace", "input": query, "output": result[:300] + "..."})
            return result
        except Exception as e:
            tool_calls_log.append({"tool": "search_workspace", "input": query, "output": f"Error: {e}"})
            return f"Error searching workspace: {e}"

    @tool
    def remember_fact(fact: str, category: str = "general") -> str:
        """
        Save an important user preference, schedule habit, or workspace fact to long-term persistent memory.
        Args:
            fact: The fact or preference to remember (e.g., 'User prefers afternoon meetings after 2pm')
            category: One of 'preference', 'schedule_habit', 'workspace_fact', 'general'
        Returns:
            Confirmation that the fact is memorized.
        """
        try:
            payload = {"content": fact, "category": category, "source": "agent_tool"}
            r = req_lib.post(f"{base_url}/api/ai/agent/memory", json=payload, headers=headers, timeout=10)
            if r.status_code in (200, 201):
                result = f"🧠 Stored in long-term memory: '{fact}'"
                tool_calls_log.append({"tool": "remember_fact", "input": fact, "output": result})
                return result
            else:
                tool_calls_log.append({"tool": "remember_fact", "input": fact, "output": "Failed to store memory"})
                return "Failed to save memory to database."
        except Exception as e:
            tool_calls_log.append({"tool": "remember_fact", "input": fact, "output": f"Error: {e}"})
            return f"Error storing memory: {e}"

    @tool
    def web_search(query: str) -> str:
        """
        Search the live web using DuckDuckGo for current information.
        Args:
            query: Search query string
        Returns:
            Live search results from the web.
        """
        try:
            from langchain_community.utilities import DuckDuckGoSearchAPIWrapper
            from langchain_community.tools import DuckDuckGoSearchResults
            wrapper = DuckDuckGoSearchAPIWrapper(max_results=4)
            tool_instance = DuckDuckGoSearchResults(api_wrapper=wrapper, output_format="list")
            raw = tool_instance.invoke(query)
            if isinstance(raw, list) and raw:
                formatted = "\n\n".join(
                    f"**{i+1}. {r.get('title', 'Result')}**\n{r.get('snippet', '')}\n🔗 {r.get('link', '')}"
                    for i, r in enumerate(raw) if isinstance(r, dict)
                )
                result = f"🌐 Web search results for '{query}':\n\n{formatted}"
            else:
                result = f"No web results found for '{query}'."
            tool_calls_log.append({"tool": "web_search", "input": query, "output": result[:300] + "..."})
            return result
        except Exception as e:
            tool_calls_log.append({"tool": "web_search", "input": query, "output": f"Error: {e}"})
            return f"Error searching the web: {e}"

    return [
        create_calendar_event,
        update_calendar_event,
        delete_calendar_event,
        list_calendar_events,
        create_page,
        update_page,
        list_pages,
        search_workspace,
        remember_fact,
        web_search,
    ]


@app.post("/agent", response_model=AgentResponse, dependencies=[Depends(_verify_internal_secret)])
def run_agent(req: AgentRequest, x_workspace_id: Optional[str] = Header(None, alias="X-Workspace-Id")):
    """
    LangChain tool-calling AI Agent endpoint with multi-persona, long-term memory,
    and workspace action execution (calendar scheduling/revisions, pages, RAG).
    """
    req.workspaceId = _resolve_workspace_id(x_workspace_id, req.workspaceId)
    # SECURITY: geminiApiKey from request body is ignored; read only from environment
    api_key = (
        os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    ).strip().strip('"').strip("'")

    if not api_key or api_key.startswith("your-") or len(api_key) < 20:
        return AgentResponse(
            answer=(
                "⚠️ **Gemini API key not configured.** "
                "Please add `GEMINI_API_KEY` to your `.env` file to use the AI Agent."
            ),
            toolCalls=[],
        )

    tool_calls_log: list = []

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage

        # Build authenticated LangChain tools
        tools = _build_agent_tools(req.nextjsBaseUrl, req.sessionToken, req.workspaceId, tool_calls_log)
        tools_map = {t.name: t for t in tools}

        llm = ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            google_api_key=api_key,
            temperature=0.1,
        )

        import datetime
        today_dt = datetime.datetime.now()
        today = today_dt.strftime("%A, %B %d, %Y at %H:%M")
        today_date_only = today_dt.strftime("%Y-%m-%d")

        # Persona Instructions
        persona_instructions = {
            "project_hr": (
                "You are Project HR — an empathetic, proactive, and organized People & Operations assistant inside Notion.\n"
                "You excel at scheduling team syncs, 1-on-1s, onboarding plans, culture docs, and meeting agendas."
            ),
            "executive_assistant": (
                "You are the Executive Assistant — an ultra-concise, fast, action-driven scheduling and workspace master.\n"
                "You proactively manage calendars, execute revisions immediately, organize tasks, and cut straight to the point."
            ),
            "tech_lead": (
                "You are the Tech Lead & Product Manager — structured, rigorous, and engineering-focused.\n"
                "You build product roadmaps, technical specs, sprint plans, and turn discussions into concrete tasks."
            ),
            "note_taker": (
                "You are the Personal Secretary & Document Architect.\n"
                "You format ideas into beautiful Notion pages, organize thoughts, and structure notes cleanly."
            ),
        }

        persona_key = (req.persona or "project_hr").lower()
        persona_intro = req.personaCustomPrompt or persona_instructions.get(persona_key, persona_instructions["project_hr"])

        # Format memories
        memories_text = "(none yet)"
        if req.memories and len(req.memories) > 0:
            memories_text = "\n".join(f"- {m}" for m in req.memories[:12])

        system_prompt_content = f"""{persona_intro}

CURRENT DATE & TIME: {today} (Reference ISO: {today_date_only})

LONG-TERM USER MEMORY & PREFERENCES:
{memories_text}

AVAILABLE WORKSPACE & WEB TOOLS:
- create_calendar_event: Schedule new events (requires title and date in YYYY-MM-DD).
- update_calendar_event: Revise, reschedule, or change existing events.
- delete_calendar_event: Cancel or delete calendar events.
- list_calendar_events: View upcoming calendar events with their IDs.
- create_page: Create a new rich, detailed Notion page/document with comprehensive content.
- update_page: Revise or append content to an existing page.
- list_pages: List pages in the workspace.
- search_workspace: Semantic search across workspace documents via ChromaDB vector store.
- remember_fact: Store a user preference, habit, or key fact into persistent memory.
- web_search: Real-time search via DuckDuckGo.

CRITICAL EXECUTION RULES:
1. AUTONOMOUS MULTI-STEP EXECUTION:
   - When the user asks you to search and create a page (e.g. "search for X and create a page", "research Open Source vs Proprietary LLMs and create a page"):
     * STEP 1: Immediately call `web_search` to gather comprehensive details.
     * STEP 2: Immediately call `create_page` with RICH, DETAILED, WELL-STRUCTURED content.
     * DO NOT stop after searching! You MUST complete the full request!
   - For calendar actions, call the tool immediately without asking for confirmations.
   - For user preferences or habits, call `remember_fact`.

2. CONTENT QUALITY RULES (MANDATORY for create_page and update_page):
   You are an elite technical document architect and writer. Pages MUST feel like meticulously authored Notion documents, never shallow AI slop or generic outlines.
   - DEPTH & LENGTH: Provide at least 500-800 words of thorough, substantive, and highly informative content. Never create brief 1-2 sentence placeholders.
   - HIERARCHY & STRUCTURE: Organize logically with 3-6 major sections using:
     * `# Section Title` (Heading 1 - for top-level thematic sections)
     * `## Sub-Topic` (Heading 2 - for medium section headings)
     * `### Detailed Point` (Heading 3 - for sub-topics)
   - FULL BLOCK ECOSYSTEM (MANDATORY): Utilize all basic blocks from Notion's block palette:
     * Regular paragraphs with substantive explanations (3-5 informative sentences each)
     * `- Bullet points` for comparisons, pros/cons, key attributes, features
     * `1. Numbered lists` for workflows, sequential steps, or priority rankings
     * `> Block quotes` or `> 💡 Callout` for key takeaways, insights, or best practices
     * ```code blocks``` (with language specified, e.g. python, bash, json) for commands, snippets, or configs
     * `---` Dividers between major conceptual sections for clean visual pacing
     * `- [ ] Checklists` for actionable steps or implementation checklists
   - NO RAW MARKDOWN SYMBOLS IN CONTENT: Ensure each section is distinct and formatted cleanly so each block parses into its native Notion block component.

3. DATE COMPUTATION:
   - Today is {today} ({today_date_only}).
   - Compute relative dates ("tomorrow", "this Thursday", "next Monday") accurately.
   - For 12-hour times like "3pm", convert to 24-hour format "15:00".

4. TONE & EXECUTIVE-LEVEL CHAT RESPONSE:
   - NEVER give a brief or dismissive answer like "I've created the page."
   - Always provide a rich, structured executive summary directly in your chat response:
     * State the exact page created and its location (Private / Shared)
     * Provide key takeaways and a bulleted digest of the most important insights
     * Highlight what each section of the new page covers
     * Include next steps or suggest follow-up actions (e.g. adding database views, scheduling reviews)
"""

        # Prepare messages
        messages = [SystemMessage(content=system_prompt_content)]
        for turn in (req.history or [])[-8:]:
            role = turn.get("role", "user")
            text = str(turn.get("text", ""))[:3000]
            if role == "user":
                messages.append(HumanMessage(content=text))
            elif role == "assistant":
                messages.append(AIMessage(content=text))
        messages.append(HumanMessage(content=req.message))

        # Invoke model with LangChain tools bound
        llm_with_tools = llm.bind_tools(tools)
        
        # Multi-step tool execution loop (up to 4 steps)
        max_steps = 4
        curr_msg = llm_with_tools.invoke(messages)
        steps = 0

        while getattr(curr_msg, "tool_calls", None) and steps < max_steps:
            messages.append(curr_msg)
            steps += 1
            for tc in curr_msg.tool_calls:
                t_name = tc.get("name", "")
                t_args = tc.get("args", {})
                t_id = tc.get("id", f"call_{len(tool_calls_log)}")
                if t_name in tools_map:
                    try:
                        output = tools_map[t_name].invoke(t_args)
                    except Exception as invoke_err:
                        output = f"Error executing {t_name}: {invoke_err}"
                    messages.append(ToolMessage(content=str(output), tool_call_id=t_id))

            # Allow the agent to call another tool (e.g. create_page after web_search)
            if steps < max_steps:
                curr_msg = llm_with_tools.invoke(messages)
            else:
                curr_msg = llm.invoke(messages)

        answer = str(curr_msg.content or "I processed your request.")

        return AgentResponse(
            answer=answer,
            toolCalls=[AgentToolCall(**tc) for tc in tool_calls_log],
        )

    except Exception as e:
        print(f"[/agent error] {e}")
        import traceback
        traceback.print_exc()

        # Graceful degradation fallback
        fallback_answer = _llm(
            system=f"You are {req.persona or 'Project HR'}. Help the user directly.",
            context="",

            user_query=req.message,
            api_key=api_key,
            history=req.history,
        )
        return AgentResponse(
            answer=fallback_answer,
            toolCalls=[AgentToolCall(**tc) for tc in tool_calls_log],
        )

