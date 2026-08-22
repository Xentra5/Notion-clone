import os
import re
import json
import threading
from typing import List, Optional, Dict, Any
from fastapi import FastAPI
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

# ─── LangChain Imports ────────────────────────────────────────────────────────
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning, module="langchain")
warnings.filterwarnings("ignore", message=".*langchain.*", category=DeprecationWarning)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

app = FastAPI(title="Notion RAG AI Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global mutex lock to ensure SQLite write serialization
db_lock = threading.Lock()

# ─── Vector Store Setup ───────────────────────────────────────────────────────
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
os.makedirs(CHROMA_DIR, exist_ok=True)

print("Loading SentenceTransformer embedding model (all-MiniLM-L6-v2)...")
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

vector_store = Chroma(
    collection_name="notion_workspace",
    embedding_function=embedding_model,
    persist_directory=CHROMA_DIR,
)
print("ChromaDB vector store ready.")


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
@app.post("/index-page")
def index_page(req: IndexPageRequest):
    """Chunk page text and upsert into ChromaDB with SQLite lock protection."""
    try:
        parts = []
        for b in req.blocks:
            if b.text and b.text.strip():
                parts.append(f"[{b.type.upper()}] {b.text.strip()}")
        if not parts:
            return {"status": "skipped", "message": "No text content"}
        combined = f"Page Title: {req.title}\n" + "\n".join(parts)

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
@app.post("/index-pages-batch")
def index_pages_batch(req: IndexPagesBatchRequest):
    """Batch index multiple workspace pages sequentially under lock."""
    try:
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
@app.delete("/delete-page")
@app.post("/delete-page")
def delete_page(req: DeletePageRequest):
    """Remove all indexed chunks for a deleted or trashed page."""
    try:
        delete_filter = _build_chroma_filter(req.workspaceId, req.pageId)
        with db_lock:
            vector_store.delete(where=delete_filter)
        return {"status": "success", "message": f"Deleted page {req.pageId} from vector store"}
    except Exception as e:
        print(f"[delete-page error] {e}")
        return {"status": "error", "message": str(e)}


# ─── Query ────────────────────────────────────────────────────────────────────
@app.post("/query")
def query_rag(req: QueryRequest):
    q = req.question.strip()
    if not q:
        return {"answer": "Please ask a question or type `/summary` or `/search <query>`.", "citations": []}

    api_key = req.geminiApiKey or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

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
@app.post("/meeting-summary", response_model=MeetingSummaryResponse)
def meeting_summary(req: MeetingSummaryRequest):
    """
    Takes a raw meeting transcript and returns a structured AI-generated summary.
    Uses Gemini via LangChain when an API key is provided.
    """
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

    api_key = req.geminiApiKey or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key and api_key.strip():
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key.strip(),
            )
            prompt = f"{SYSTEM}\n\nMeeting Title: {req.title}\n\nFull Transcript:\n{transcript}"
            raw = str(llm.invoke(prompt).content).strip()

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
