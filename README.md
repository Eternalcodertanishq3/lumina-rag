# 🌟 Lumina RAG

A production-ready Retrieval-Augmented Generation (RAG) application built for the Predusk AI Engineer Internship Assessment.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)
![Gemini](https://img.shields.io/badge/Google-Gemini%201.5-4285F4?logo=google)

## 🎯 Live Demo

- **Frontend:** [https://lumina-rag.vercel.app](https://lumina-rag.vercel.app)
- **Backend API:** [https://lumina-rag-api.railway.app](https://lumina-rag-api.railway.app)

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LUMINA RAG SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐           ┌──────────────────────────────────────────┐  │
│   │   Frontend   │           │              Backend (FastAPI)            │  │
│   │   (Next.js)  │◄─────────►│                                          │  │
│   │              │   REST    │  ┌─────────┐  ┌─────────┐  ┌──────────┐ │  │
│   │  • Chat UI   │   API     │  │ Ingest  │  │   RAG   │  │   Auth   │ │  │
│   │  • Ingest    │           │  │ Router  │  │ Pipeline│  │  (JWT)   │ │  │
│   │  • History   │           │  └────┬────┘  └────┬────┘  └────┬─────┘ │  │
│   └──────────────┘           │       │            │            │        │  │
│                              └───────┼────────────┼────────────┼────────┘  │
│                                      │            │            │           │
│   ┌──────────────────────────────────┼────────────┼────────────┼─────────┐ │
│   │                                  ▼            ▼            ▼         │ │
│   │  ┌───────────────────┐   ┌───────────────┐   ┌──────────────────┐   │ │
│   │  │   Gemini API      │   │   FlashRank   │   │    Supabase      │   │ │
│   │  │                   │   │   (Reranker)  │   │                  │   │ │
│   │  │ • Embeddings      │   │               │   │ • pgvector       │   │ │
│   │  │   (768 dims)      │   │ • TinyBERT    │   │ • Auth (RLS)     │   │ │
│   │  │ • Gemini Flash    │   │ • Cross-Enc.  │   │ • Chat History   │   │ │
│   │  └───────────────────┘   └───────────────┘   └──────────────────┘   │ │
│   │                              EXTERNAL SERVICES                       │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Ingestion Pipeline:**

   ```
   Document → Chunking → Embedding (Gemini) → Store (Supabase pgvector)
   ```

2. **Query Pipeline:**
   ```
   Query → Embed → Vector Search → Rerank (FlashRank) → LLM (Gemini) → Response + Citations
   ```

---

## ⚙️ Technical Specifications

### Chunking Strategy

| Parameter      | Value                        | Rationale                                        |
| -------------- | ---------------------------- | ------------------------------------------------ |
| **Chunk Size** | 1000 characters              | Balances context richness with embedding quality |
| **Overlap**    | 200 characters (20%)         | Preserves context at chunk boundaries            |
| **Method**     | Recursive Character Splitter | Respects paragraph/sentence boundaries           |

```python
# backend/utils.py
def recursive_character_text_splitter(text, chunk_size=1000, overlap=200):
    # Splits on paragraphs, then sentences, then words
```

### Embedding Configuration

| Component      | Specification          |
| -------------- | ---------------------- |
| **Model**      | `gemini-embedding-001` |
| **Dimensions** | 768                    |
| **Task Type**  | `retrieval_document`   |

### Reranker Settings

| Component             | Specification                        |
| --------------------- | ------------------------------------ |
| **Model**             | FlashRank `ms-marco-TinyBERT-L-2-v2` |
| **Type**              | Cross-Encoder                        |
| **Initial Retrieval** | Top 25 candidates                    |
| **Final Selection**   | Top 5 after reranking                |

```python
# backend/rag_pipeline.py
ranker = Ranker(model_name="ms-marco-TinyBERT-L-2-v2")
response = supabase.rpc("match_documents", {..., "match_count": 25})  # Over-fetch
ranked_results = ranker.rerank(rerank_request)[:5]  # Top 5 after rerank
```

### Vector Search

| Parameter      | Value                           |
| -------------- | ------------------------------- |
| **Database**   | Supabase pgvector               |
| **Index Type** | IVFFlat                         |
| **Similarity** | Cosine (negative inner product) |
| **Threshold**  | 0.5 minimum similarity          |

---

## 🚀 Features

- ✅ **Multi-format Ingestion:** Text, PDF, TXT, MD files
- ✅ **Web Scraping:** Paste any URL to ingest content
- ✅ **Semantic Search:** Vector similarity with pgvector
- ✅ **Hybrid Reranking:** FlashRank cross-encoder for precision
- ✅ **Inline Citations:** `[1], [2]` format with source hover
- ✅ **Chat History:** Persistent conversations with Supabase
- ✅ **User Authentication:** Supabase Auth with Row Level Security
- ✅ **Premium UI:** Glassmorphism design with animated avatar

---

## 🛠️ Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Supabase account

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/lumina-rag.git
cd lumina-rag
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
```

Run backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev
```

### 4. Database Schema

Run in Supabase SQL Editor:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(768),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
) RETURNS TABLE(id UUID, content TEXT, metadata JSONB, similarity FLOAT, user_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity,
    d.user_id
  FROM documents d
  WHERE d.user_id = auth.uid()
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
```

---

## 📡 API Endpoints

| Method   | Endpoint               | Description             |
| -------- | ---------------------- | ----------------------- |
| `GET`    | `/health`              | Health check            |
| `POST`   | `/ingest`              | Ingest text/file        |
| `POST`   | `/ingest/url`          | Scrape and ingest URL   |
| `POST`   | `/chat`                | Query with RAG          |
| `GET`    | `/chats`               | Get user's chat history |
| `GET`    | `/chats/{id}/messages` | Get messages for a chat |
| `DELETE` | `/chats/{id}`          | Delete a chat           |

### Sample cURL

```bash
# Health Check
curl http://localhost:8000/health

# Chat Query (requires auth token)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "What is machine learning?", "chat_id": null}'
```

---

## 📝 Remarks & Tradeoffs

### Design Decisions

1. **FlashRank over Cohere/Voyage Rerankers**
   - **Why:** Zero API cost, runs locally, no rate limits
   - **Tradeoff:** Slightly lower accuracy than cloud rerankers, but sufficient for this use case

2. **Gemini over OpenAI**
   - **Why:** Generous free tier, good embedding quality
   - **Tradeoff:** Rate limits on free tier can affect large document ingestion

3. **pgvector over Pinecone/Weaviate**
   - **Why:** Single database for vectors + auth + chat history (Supabase)
   - **Tradeoff:** Query performance at scale (millions of vectors) may be slower

4. **1000 char chunks with 20% overlap**
   - **Why:** Balances semantic coherence with retrieval precision
   - **Tradeoff:** Very long documents may lose some cross-section context

5. **Row Level Security (RLS)**
   - **Why:** User data isolation at the database level - more secure than app-level filtering
   - **Tradeoff:** Requires proper JWT setup and scoped Supabase clients

### Known Limitations

- **Rate Limits:** Gemini API free tier limits may cause failures on large PDFs (100+ chunks)
- **PDF Parsing:** Complex layouts (tables, multi-column) may not parse perfectly
- **No Streaming:** Responses are not streamed; full response waits for completion

### Future Improvements

- [ ] Add streaming responses for better UX
- [ ] Implement hybrid search (keyword + semantic)
- [ ] Add document management UI (delete, view chunks)
- [ ] Support more file formats (DOCX, XLSX)

---

## 👤 Author

**Tanishq Mangal**  
📧 tanishkmangal3@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/tanishq-mangal-7a2683254/)  
🌐 [Portfolio](https://tanishq-creates.netlify.app/)

---

## 📄 License

MIT License - feel free to use this for learning and personal projects.
