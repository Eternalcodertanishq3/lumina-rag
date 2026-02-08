from backend.gemini_service import get_embedding, generate_response
from backend.supabase_client import get_supabase_client, get_scoped_client
from backend.utils import recursive_character_text_splitter
from flashrank import Ranker, RerankRequest
import os
import time

# Initialize FlashRank (lite model)
ranker = Ranker(model_name="ms-marco-TinyBERT-L-2-v2", cache_dir="./flashrank_cache")

def ingest_document(text: str, source: str, user_id: str, token: str):
    """Chunk, embed, and store document in Supabase for a specific user."""
    chunks = recursive_character_text_splitter(text)
    # Use scoped client to respect RLS
    supabase = get_scoped_client(token)
    
    records = []
    total_chunks = len(chunks)
    print(f"[Ingest] Processing {total_chunks} chunks for source: {source}")
    
    for i, chunk in enumerate(chunks):
        # Rate limiting: add small delay between API calls to avoid hitting limits
        if i > 0 and i % 5 == 0:
            print(f"[Ingest] Processed {i}/{total_chunks} chunks, pausing briefly...")
            time.sleep(0.5)  # Pause every 5 chunks
        
        embedding = get_embedding(chunk)
        records.append({
            "content": chunk,
            "metadata": {"source": source, "chunk_index": i},
            "embedding": embedding,
            "user_id": user_id
        })
        
    # Batch insert
    print(f"[Ingest] Inserting {len(records)} records to database...")
    response = supabase.table("documents").insert(records).execute()
    print(f"[Ingest] Ingestion complete for: {source}")
    return len(records)

def retrieve_and_rank(query: str, user_id: str, token: str, top_k: int = 5):
    """Retrieve documents using vector search and rerank them, scoped to user."""
    # Use scoped client to respect RLS
    supabase = get_scoped_client(token)
    query_embedding = get_embedding(query)
    
    # Semantic Search via Supabase RPC
    # Now that we use a scoped client, RLS (auth.uid()) should work if the policy allows.
    # However, for 'match_documents' RPC, RLS inside the function depends on how it's defined (SECURITY INVOKER vs DEFINER).
    # If it's SECURITY INVOKER (default), it uses the current user's permissions.
    # The SQL I provided in auth_schema.sql filters by `documents.user_id = auth.uid()`.
    # So valid auth context is required.
    
    response = supabase.rpc("match_documents", {
        "query_embedding": query_embedding,
        "match_threshold": 0.5,
        "match_count": top_k * 5
    }).execute()
    
    results = response.data
    if not results:
        return []

    # Extra safety filter (though RLS should handle it)
    relevant_docs = [doc for doc in results if doc.get('user_id') == user_id]

    if not relevant_docs:
        return []

    # Rerank with FlashRank
    rerank_request = RerankRequest(
        query=query, 
        passages=[{"id": str(doc['id']), "text": doc['content'], "meta": doc['metadata']} for doc in relevant_docs]
    )
    ranked_results = ranker.rerank(rerank_request)
    
    # Return top K ranked results
    return ranked_results[:top_k]

def answer_query_rag(query: str, user_id: str, token: str):
    """End-to-end RAG pipeline: Retrieve -> Rerank -> Generate."""
    relevant_docs = retrieve_and_rank(query, user_id, token)
    
    if not relevant_docs:
        return {
            "answer": "I couldn't find any relevant information in your documents to answer your question.",
            "citations": []
        }
    
    context_str = ""
    citations = []
    
    for i, doc in enumerate(relevant_docs):
        citation_id = i + 1
        context_str += f"[Source {citation_id}]: {doc['text']}\n"
        citations.append({
            "id": citation_id,
            "content": doc['text'],
            "metadata": doc['meta']
        })
        
    prompt = f"""
    You are an intelligent AI assistant using Retrieval Augmented Generation.
    Answer the user's question based ONLY on the provided context below.
    If the answer is not in the context, say you don't know.
    
    Context:
    {context_str}
    
    Question: {query}
    
    Instructions:
    - Cite your sources using [1], [2], etc.
    - Be concise and professional.
    """
    
    answer = generate_response(prompt)
    
    return {
        "answer": answer,
        "citations": citations
    }

