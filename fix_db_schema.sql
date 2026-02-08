-- Run this in Supabase SQL Editor to fix the dimension mismatch

-- Drop the old table (since it's empty or test data only)
drop table if exists documents cascade;

-- Recreate with 768 dimensions (for text-embedding-004)
-- Wait, if using gemini-embedding-001 (which is 768 on Vertex AI but maybe different on AI Studio?)
-- The error said "expected 768, not 3072". This means DB expected 768 (as defined) but model output 3072.
-- So model `gemini-embedding-001` outputs 3072 dimensions? (Wait, previous error said `expected 768 dimensions, not 3072`. This means DB is 768, input is 3072. So model output is 3072.)

-- So we must change DB to 3072.

create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(3072) -- Matched to models/gemini-embedding-001 (data-001)
);

-- Recreate function with 3072
create or replace function match_documents (
  query_embedding vector(3072),
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
