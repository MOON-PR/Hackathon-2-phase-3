import requests
import sys

API_URL = "http://127.0.0.1:8000"

def ensure_user_exists():
    email = "testuser_brother@gmail.com"
    password = "password123"
    name = "Brother User"
    
    print(f"Checking if user {email} exists...")
    
    # Try login first
    try:
        r = requests.post(f"{API_URL}/api/auth/login", json={"email": email, "password": password})
        if r.status_code == 200:
            print("User ALREADY EXISTS and credentials are correct.")
            print(f"Token: {r.json()['token'][:20]}...")
            return
        elif r.status_code == 401:
            print("User exists but password MIGHT be wrong, or user doesn't exist.")
        else:
            print(f"Login check failed: {r.status_code}")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # Try signup
    print("Attempting to create user...")
    try:
        r = requests.post(f"{API_URL}/api/auth/signup", json={"email": email, "password": password, "name": name})
        if r.status_code == 200:
            print("User CREATED successfully.")
        elif r.status_code == 400 and "already registered" in r.text:
            print("User already exists (confirmed by signup error).")
        else:
            print(f"Signup failed: {r.status_code}")
            with open("last_error.txt", "w") as f: f.write(r.text)
    except Exception as e:
        print(f"Signup exception: {e}")

if __name__ == "__main__":
    ensure_user_exists()
