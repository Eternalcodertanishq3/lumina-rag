-- 1. Add user_id column to documents table
-- It references auth.users.id from Supabase Auth
alter table documents 
add column if not exists user_id uuid references auth.users(id);

-- 2. Enable Row Level Security
alter table documents enable row level security;

-- 3. Create Policy: Users can only insert their OWN documents
create policy "Users can insert their own documents"
on documents for insert
to authenticated
with check (auth.uid() = user_id);

-- 4. Create Policy: Users can only select their OWN documents
create policy "Users can select their own documents"
on documents for select
to authenticated
using (auth.uid() = user_id);

-- 5. Create Policy: Users can delete their OWN documents
create policy "Users can delete their own documents"
on documents for delete
to authenticated
using (auth.uid() = user_id);

-- 6. Update the search function to filter by user_id
-- We need to drop and recreate it because signature changes
drop function if exists match_documents;

create or replace function match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float,
  user_id uuid
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity,
    documents.user_id
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
