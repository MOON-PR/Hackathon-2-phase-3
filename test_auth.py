"""
Test script to verify JWT authentication flow
"""
import requests
import json

API_URL = "http://localhost:8000"

def test_auth_flow():
    print("🔐 Testing JWT Authentication Flow...\n")
    
    # Test 1: Signup
    print("1️⃣ Testing Signup...")
    signup_data = {
        "email": "test_auth@example.com",
        "password": "testpass123",
        "name": "Test User"
    }
    
    try:
        response = requests.post(f"{API_URL}/api/auth/signup", json=signup_data)
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user")
            print(f"   ✅ Signup successful!")
            print(f"   Token: {token[:50]}...")
            print(f"   User: {user}\n")
        elif response.status_code == 400:
            print(f"   ⚠️  User already exists, trying login instead...\n")
            # Try login instead
            login_data = {
                "email": signup_data["email"],
                "password": signup_data["password"]
            }
            response = requests.post(f"{API_URL}/api/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                user = data.get("user")
                print(f"   ✅ Login successful!")
                print(f"   Token: {token[:50]}...")
                print(f"   User: {user}\n")
            else:
                print(f"   ❌ Login failed: {response.status_code} - {response.text}")
                return
        else:
            print(f"   ❌ Signup failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 2: Get Tasks with JWT
    print("2️⃣ Testing GET /api/tasks with JWT...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/api/tasks", headers=headers)
        if response.status_code == 200:
            tasks = response.json()
            print(f"   ✅ Tasks fetched successfully!")
            print(f"   Found {len(tasks)} tasks\n")
        else:
            print(f"   ❌ Failed to fetch tasks: {response.status_code} - {response.text}\n")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
        return
    
    # Test 3: Create Task with JWT
    print("3️⃣ Testing POST /api/tasks with JWT...")
    task_data = {
        "description": "Test task from auth verification",
        "category": "Testing",
        "priority": "High",
        "tags": ["test", "auth"]
    }
    
    try:
        response = requests.post(f"{API_URL}/api/tasks", json=task_data, headers=headers)
        if response.status_code == 200:
            task = response.json()
            print(f"   ✅ Task created successfully!")
            print(f"   Task ID: {task.get('id')}")
            print(f"   Description: {task.get('description')}\n")
        else:
            print(f"   ❌ Failed to create task: {response.status_code} - {response.text}\n")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
        return
    
    # Test 4: Get Conversations with JWT
    print("4️⃣ Testing GET /api/conversations with JWT...")
    try:
        response = requests.get(f"{API_URL}/api/conversations/", headers=headers)
        if response.status_code == 200:
            conversations = response.json()
            print(f"   ✅ Conversations fetched successfully!")
            print(f"   Found {len(conversations)} conversations\n")
        else:
            print(f"   ❌ Failed to fetch conversations: {response.status_code} - {response.text}\n")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
        return
    
    # Test 5: Test without JWT (should get 401)
    print("5️⃣ Testing GET /api/tasks WITHOUT JWT (should fail)...")
    try:
        response = requests.get(f"{API_URL}/api/tasks")
        if response.status_code == 401:
            print(f"   ✅ Correctly rejected unauthorized request!")
            print(f"   Status: 401 Unauthorized\n")
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    print("=" * 60)
    print("🎉 JWT Authentication Flow Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_auth_flow()
