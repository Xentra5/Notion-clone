import os
import re
import json
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

# ─── LangChain Modern Imports ─────────────────────────────────────────────────
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
    """Chunk page text and upsert into ChromaDB."""
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

        # Re-indexing is idempotent; remove stale chunks before writing the new ones.
        delete_filter = _build_chroma_filter(req.workspaceId, req.pageId)
        try:
            vector_store.delete(where=delete_filter)
        except Exception as del_err:
            print(f"[index-page delete warning] {del_err}")

        metas = [{"workspaceId": req.workspaceId, "pageId": req.pageId, "title": req.title, "chunkIndex": i} for i in range(len(chunks))]
        ids   = [f"{req.pageId}-chunk-{i}" for i in range(len(chunks))]

        vector_store.add_texts(texts=chunks, metadatas=metas, ids=ids)
        return {"status": "success", "indexed_chunks": len(chunks), "pageId": req.pageId}
    except Exception as e:
        print(f"[index-page error] {e}")
        return {"status": "error", "message": str(e)}


# ─── Delete Page Endpoint ─────────────────────────────────────────────────────
@app.delete("/delete-page")
@app.post("/delete-page")
def delete_page(req: DeletePageRequest):
    """Remove all indexed chunks for a deleted or trashed page."""
    try:
        delete_filter = _build_chroma_filter(req.workspaceId, req.pageId)
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

    # 1. /search command — live web search via DuckDuckGo
    if q.lower().startswith("/search"):
        search_q = q[7:].strip()
        if not search_q:
            return {"answer": "Please provide a search query. Example: `/search Next.js 16 features`", "citations": []}
        try:
            from langchain_community.tools import DuckDuckGoSearchRun
            web_search_tool = DuckDuckGoSearchRun()
            results = web_search_tool.run(search_q)
            return {
                "answer": f"🌐 **Web Search Results for '{search_q}':**\n\n{results}",
                "citations": [],
                "source": "web_search",
            }
        except Exception as e:
            return {"answer": f"Web search error: {str(e)}", "citations": []}

    # 2. Vector similarity search with ChromaDB-compliant filter
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

    context = "\n\n".join(relevant) if relevant else "No specific workspace notes found."

    # 3. /write command: generate content to append directly to page
    if q.lower().startswith("/write"):
        instruction = q[6:].strip()
        if not instruction:
            return {
                "answer": "Tell me what to write after `/write`, for example: `/write Explain binary search`.",
                "citations": [],
                "source": "write_help",
            }
        content = _llm(
            system="You are a Notion writing assistant. Write clean, structured content for the user's page based on their instruction. Use workspace context if relevant. Return only the content to append, no preamble or commentary.",
            context=context,
            user_query=instruction,
            api_key=api_key,
            history=req.history,
        )
        return {
            "answer": f"✍️ **Content ready to write**\n\n{content}",
            "citations": citations,
            "source": "agent_write",
            "action": "append_block",
            "content": content,
        }

    # 4. /code command: generate formatted code block
    if q.lower().startswith("/code"):
        instruction = q[5:].strip()
        if not instruction:
            return {
                "answer": "Tell me what code to create after `/code`, for example: `/code React button with loading state`.",
                "citations": [],
                "source": "code_help",
            }
        answer = _llm(
            system="You are an expert programming assistant. Provide a concise explanation and a complete, well-formatted code block.",
            context=f"Relevant workspace context:\n{context}",
            user_query=instruction,
            api_key=api_key,
            history=req.history,
        )
        return {"answer": answer, "citations": citations, "source": "code"}

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

    # 7. /summary command
    if q.lower().startswith("/summary"):
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

    # 8. Normal conversational Q&A
    if not relevant:
        return {
            "answer": f"🔍 I don't have enough context in your workspace pages to answer **\"{q}\"**.\n\n💡 Try:\n- **`/search {q}`** — live web search\n- **`/write {q}`** — have AI write content about it directly to this page\n- **`/action-items`** — extract tasks\n- Add notes about this topic to your workspace first.",
            "citations": [],
            "source": "out_of_context",
        }

    answer = _llm(
        system="You are Notion AI, a workspace assistant. You ONLY answer questions using the provided workspace context below. If the user's question cannot be answered from the context, say: \"I don't have notes on this in your workspace. Try `/search <query>` to search the web.\" — do NOT make up or generate information from general knowledge.",
        context=context,
        user_query=q,
        api_key=api_key,
        history=req.history,
    )
    return {"answer": answer, "citations": citations, "source": "workspace_rag"}


# ─── LLM Helper ───────────────────────────────────────────────────────────────
def _llm(system: str, context: str, user_query: str, api_key: Optional[str], history: Optional[List[dict]] = None) -> str:
    if api_key and api_key.strip():
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key.strip())
            prior_turns = "\n".join(
                f"{turn.get('role', 'user').title()}: {str(turn.get('text', ''))[:4000]}"
                for turn in (history or [])[-12:]
            )
            prompt = f"{system}\n\nPrevious conversation:\n{prior_turns or '(none)'}\n\nWorkspace Context:\n{context}\n\nUser Question: {user_query}"
            res = llm.invoke(prompt)
            return str(res.content)
        except Exception as e:
            print(f"[Gemini error] {e}")

    # Fallback: synthesise directly from context chunks when LLM fails or API key is absent
    lines = [c.split("]: ", 1)[-1].strip() for c in context.split("\n\n") if "]: " in c]
    if lines:
        return "Based on your workspace notes:\n\n" + "\n".join(f"• {l}" for l in lines[:5])
    return "No content available to answer the query."


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
