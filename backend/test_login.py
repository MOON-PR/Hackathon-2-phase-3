import requests
import sys

def test_login():
    url = "http://localhost:8000/api/auth/login"
    payload = {
        "email": "test@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("Login Successful!")
            print(response.json())
        else:
            print(f"Login Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    test_login()
