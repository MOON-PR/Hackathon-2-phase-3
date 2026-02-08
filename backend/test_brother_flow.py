import requests
import sys

API_URL = "http://127.0.0.1:8000"

def test_full_flow():
    # 1. Signup
    print("Testing Signup...")
    email = "testuser_brother@gmail.com"
    password = "password123"
    name = "Brother User"
        
    signup_payload = {"email": email, "password": password, "name": name}
    try:
        r = requests.post(f"{API_URL}/api/auth/signup", json=signup_payload)
        if r.status_code == 200:
            print("Signup Success")
        elif r.status_code == 400 and "Email already registered" in r.text:
            print("User already exists, proceeding to login")
        else:
            print(f"Signup Failed: {r.status_code} {r.text}")
            # return  <-- Removed return to force proceed for debugging if needed, or better logic above covers it
    except Exception as e:
        print(f"Signup Exception: {e}")
        return

    # 2. Login
    print("\nTesting Login...")
    login_payload = {"email": email, "password": password}
    token = None
    try:
        r = requests.post(f"{API_URL}/api/auth/login", json=login_payload)
        if r.status_code == 200:
            data = r.json()
            token = data["token"]
            print(f"Login Success. Token: {token[:10]}...")
        else:
            print(f"Login Failed: {r.status_code} {r.text}")
            return
    except Exception as e:
        print(f"Login Exception: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Task
    print("\nTesting Create Task...")
    task_payload = {"description": "Test Task for Brother", "priority": "High"}
    try:
        r = requests.post(f"{API_URL}/api/tasks", json=task_payload, headers=headers)
        if r.status_code == 200:
            print(f"Create Task Success: {r.json()}")
        else:
            print(f"Create Task Failed: {r.status_code} {r.text}")
    except Exception as e:
        print(f"Create Task Exception: {e}")

    # 4. List Tasks
    print("\nTesting List Tasks...")
    try:
        r = requests.get(f"{API_URL}/api/tasks", headers=headers)
        if r.status_code == 200:
            tasks = r.json()
            print(f"List Tasks Success: Found {len(tasks)} tasks")
            if tasks:
                print(f"Task 1: {tasks[0]}")
        else:
            print(f"List Tasks Failed: {r.status_code} {r.text}")
    except Exception as e:
        print(f"List Tasks Exception: {e}")

if __name__ == "__main__":
    test_full_flow()
