import requests
import json

url = "http://127.0.0.1:8000/chat"
payload = {
    "query": "tell me about mini rag"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(response.text)
    else:
        print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
