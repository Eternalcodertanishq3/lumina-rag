-- 1. Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 2. Create/Recreate a table to store your documents (768 dimensions for text-embedding-004)
-- If table exists, you can drop it first:
drop table if exists documents;

create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768) 
);

-- 3. Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
