
import requests
import json
import uuid
import sys

def test_signup():
    print("Checking API Health...")
    try:
        health = requests.get("http://localhost:8000/api/health")
        print(f"Health Status: {health.status_code}")
        print(f"Health Body: {health.text}")
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return

    print("\nAttempting signup...")
    try:
        url = "http://localhost:8000/api/auth/signup"
        unique_suffix = uuid.uuid4().hex[:8]
        unique_email = f"test_user_{unique_suffix}@example.com"
        payload = {
            "email": unique_email,
            "password": "password123",
            "name": "Test User"
        }
        headers = {'Content-Type': 'application/json'}

        print(f"Attempting signup with {unique_email}...")
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_signup()
