import requests

url = "http://127.0.0.1:8000/ingest"

# Create a dummy text file
with open("test_upload.txt", "w") as f:
    f.write("This is a content from a text file upload.")

files = {
    'file': ('test_upload.txt', open('test_upload.txt', 'rb'), 'text/plain')
}
data = {
    'source': 'Test File Upload'
}

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
