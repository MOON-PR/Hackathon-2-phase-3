import requests
import sys

def test_list_users_api():
    # Helper to login first
    login_url = "http://localhost:8000/api/auth/login"
    login_payload = {
        "email": "ali@gmail.com", # existing user from previous output
        "password": "password123" # assuming default password for test
    }
    
    try:
        # Check health first
        health = requests.get("http://localhost:8000/api/health")
        print(f"Health check: {health.status_code} {health.text}")
        
    except Exception as e:
        print(f"API Health check failed: {e}")
        return

if __name__ == "__main__":
    test_list_users_api()
