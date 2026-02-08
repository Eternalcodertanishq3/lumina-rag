def recursive_character_text_splitter(
    text: str, 
    chunk_size: int = 4000, 
    chunk_overlap: int = 400
) -> list[str]:
    """
    Split text into chunks of specified size with overlap.
    Simple implementation without langchain dependency for lightweight usage.
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        if end >= text_length:
            chunks.append(text[start:])
            break
        
        # Try to find the last space within the chunk to avoid splitting words
        search_end = min(end, text_length)
        last_space = text.rfind(' ', start, search_end)
        
        if last_space != -1 and last_space > start:
            end = last_space
        
        chunks.append(text[start:end])
        start = end - chunk_overlap
        
        # Ensure progress
        if start >= end:
            start = end

    return chunks
