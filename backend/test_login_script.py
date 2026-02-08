import requests
import json

BASE_URL = "http://127.0.0.1:8001/api/auth/login"
EMAIL = "ali@gmail.com"
PASSWORD = "password"

def test_login():
    print(f"Attempting login to {BASE_URL} with {EMAIL}...")
    try:
        response = requests.post(BASE_URL, json={"email": EMAIL, "password": PASSWORD})
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Raw Response: {response.text}")
            
        if response.status_code == 200:
            print("LOGIN SUCCESSFUL!")
        else:
            print("LOGIN FAILED.")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_login()
