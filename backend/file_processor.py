from fastapi import UploadFile, HTTPException
import pypdf
import io

async def process_file(file: UploadFile) -> str:
    """
    Extract text content from uploaded file (PDF or TXT).
    """
    content = ""
    
    if file.filename.endswith(".pdf"):
        try:
            # Read PDF file
            pdf_bytes = await file.read()
            pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            
            # Extract text from each page
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    content += text + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")
            
    elif file.filename.endswith(".txt") or file.filename.endswith(".md"):
        try:
            # Read text file
            content_bytes = await file.read()
            content = content_bytes.decode("utf-8")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading text file: {str(e)}")
            
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .pdf, .txt, or .md")
        
    if not content.strip():
        raise HTTPException(status_code=400, detail="File is empty or could not extract text")
        
    return content
