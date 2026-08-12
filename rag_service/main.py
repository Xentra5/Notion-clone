import os
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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

class QueryRequest(BaseModel):
    question: str
    workspaceId: str = "default"
    pageId: Optional[str] = None
    geminiApiKey: Optional[str] = None
    history: List[dict] = Field(default_factory=list)

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
        vector_store.delete(where={"workspaceId": req.workspaceId, "pageId": req.pageId})
        metas = [{"workspaceId": req.workspaceId, "pageId": req.pageId, "title": req.title, "chunkIndex": i} for i in range(len(chunks))]
        ids   = [f"{req.pageId}-chunk-{i}" for i in range(len(chunks))]

        vector_store.add_texts(texts=chunks, metadatas=metas, ids=ids)
        return {"status": "success", "indexed_chunks": len(chunks), "pageId": req.pageId}
    except Exception as e:
        print(f"[index-page error] {e}")
        return {"status": "error", "message": str(e)}

# ─── Query ────────────────────────────────────────────────────────────────────
@app.post("/query")
def query_rag(req: QueryRequest):
    q = req.question.strip()
    if not q:
        return {"answer": "Please ask a question or type `/summary` or `/search <query>`.", "citations": []}

    # 1. /search command — live web search
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

    # 2. Vector similarity search
    search_filter = {"workspaceId": req.workspaceId}
    if req.pageId:
        search_filter["pageId"] = req.pageId
    search_results = vector_store.similarity_search_with_score(q, k=4, filter=search_filter)
    relevant, citations_set, citations = [], set(), []
    for doc, score in search_results:
        if score < 1.3:
            pid   = doc.metadata.get("pageId", "")
            title = doc.metadata.get("title", "Untitled")
            relevant.append(f"[{title}]: {doc.page_content}")
            if pid and pid not in citations_set:
                citations_set.add(pid)
                citations.append({"pageId": pid, "title": title})

    # /write command: generate content through LangChain and tell the frontend
    # to append it to the active page.
    if q.lower().startswith("/write"):
        instruction = q[6:].strip()
        if not instruction:
            return {
                "answer": "Tell me what to write after `/write`, for example: `/write Explain binary search`.",
                "citations": [],
                "source": "write_help",
            }
        context = "\n\n".join(relevant) or "No existing workspace context was found."
        content = _llm(
            system="You are a Notion writing assistant. Return only the content requested by the user, without commentary.",
            context=context,
            user_query=instruction,
            api_key=req.geminiApiKey,
            history=req.history,
        )
        return {
            "answer": f"✍️ **Content ready to write**\n\n{content}",
            "citations": citations,
            "source": "agent_write",
            "action": "append_block",
            "content": content,
        }

    if q.lower().startswith("/code"):
        instruction = q[5:].strip()
        if not instruction:
            return {"answer": "Tell me what code to create after `/code`, for example: `/code React button with loading state`.", "citations": [], "source": "code_help"}
        answer = _llm(
            system="You are an expert programming assistant. Provide a concise explanation and a complete, well-formatted code block.",
            context="Relevant workspace context:\n" + ("\n\n".join(relevant) or "(none)"),
            user_query=instruction,
            api_key=req.geminiApiKey,
            history=req.history,
        )
        return {"answer": answer, "citations": citations, "source": "code"}

    # 3. /summary command
    if q.lower().startswith("/summary"):
        if not relevant:
            return {
                "answer": "⚠️ I don't have enough context in your workspace pages to generate a summary. Add some text blocks to your pages first, or use `/search <query>` to search the web.",
                "citations": [],
            }
        context = "\n\n".join(relevant)
        answer  = _llm(
            system="You are Notion AI. Write a structured executive summary with headings: Key Takeaways, Key Decisions, and Action Items. Use ONLY the provided context.",
            context=context,
            user_query="Summarize this workspace content.",
            api_key=req.geminiApiKey,
            history=req.history,
        )
        return {"answer": f"📝 **Workspace Executive Summary**\n\n{answer}", "citations": citations}

    # 4. Normal conversational Q&A
    if not relevant:
        relevant = ["No workspace note is relevant to this conversation. Answer normally and honestly."]
    if not relevant:
        return {
            "answer": "⚠️ I don't have enough context in your workspace pages to answer this question.\n\nTry `/search <query>` to search the web instead.",
            "citations": [],
            "source": "out_of_context_fallback",
        }

    context = "\n\n".join(relevant)
    answer  = _llm(
        system="You are Notion AI, a helpful conversational assistant. Respond naturally to the user. Use workspace context when it helps, but never invent facts from it.",
        context=context,
        user_query=q,
        api_key=req.geminiApiKey,
        history=req.history,
    )
    return {"answer": answer, "citations": citations, "source": "workspace_rag"}

# ─── LLM helper ───────────────────────────────────────────────────────────────
def _llm(system: str, context: str, user_query: str, api_key: Optional[str], history: Optional[List[dict]] = None) -> str:
    if api_key and api_key.strip():
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm    = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key.strip())
            prior_turns = "\n".join(
                f"{turn.get('role', 'user').title()}: {str(turn.get('text', ''))[:4000]}"
                for turn in (history or [])[-12:]
            )
            prompt = f"{system}\n\nPrevious conversation:\n{prior_turns or '(none)'}\n\nWorkspace Context:\n{context}\n\nUser Question: {user_query}"
            return llm.invoke(prompt).content
        except Exception as e:
            print(f"[Gemini error] {e}")

    # Fallback: synthesise from context chunks
    lines = [c.split("]: ", 1)[-1].strip() for c in context.split("\n\n") if "]: " in c]
    return "Based on your workspace notes:\n\n" + "\n".join(f"• {l}" for l in lines[:5])
