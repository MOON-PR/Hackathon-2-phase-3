import requests
import sys

API_URL = "http://127.0.0.1:8000"

def test_chatbot_crud():
    # 1. Login to get token
    print("Logging in...")
    email = "testuser_brother@gmail.com"
    password = "password123"
    login_payload = {"email": email, "password": password}
    
    try:
        r = requests.post(f"{API_URL}/api/auth/login", json=login_payload)
        if r.status_code == 200:
            token = r.json()["token"]
            print("Login Success")
        else:
            print(f"Login Failed: {r.status_code} {r.text}")
            return
    except Exception as e:
        print(f"Login Exception: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # Helper function to send chat message
    def send_chat(message):
        print(f"\nSending Chat: '{message}'")
        chat_payload = {
            "messages": [{"role": "user", "content": message}]
        }
        try:
            r = requests.post(f"{API_URL}/api/chat/", json=chat_payload, headers=headers)
            if r.status_code == 200:
                data = r.json()
                print(f"Chat Response: {data['response']}")
                print(f"Tools Called: {data.get('tool_calls', 'None')}")
                return data
            else:
                print(f"Chat Request Failed: {r.status_code} {r.text}")
                return None
        except Exception as e:
            print(f"Chat Exception: {e}")
            return None

    # 1. Create Task
    print("\n--- Testing CREATE ---")
    send_chat("Add a task to buy advanced groceries")

    # verify creation via API
    r_tasks = requests.get(f"{API_URL}/api/tasks?search=advanced", headers=headers)
    tasks = r_tasks.json()
    if not tasks:
        print("❌ CREATE verification failed: Task not found")
        return
    task_id = tasks[0]["id"]
    print(f"✅ Task Created: {tasks[0]['description']} (ID: {task_id})")

    # 2. List Tasks
    print("\n--- Testing LIST ---")
    send_chat("List my tasks")
    
    # 3. Update Task
    print("\n--- Testing UPDATE ---")
    send_chat(f"Update task {task_id} to 'Buy super groceries'")
    
    # verify update
    r_update = requests.get(f"{API_URL}/api/tasks/{task_id}", headers=headers)
    if r_update.ok and r_update.json()["description"] == "Buy super groceries":
        print(f"✅ Task Updated Verified: {r_update.json()['description']}")
    else:
        print(f"❌ UPDATE verification failed: {r_update.text}")

    # 4. Complete Task
    print("\n--- Testing COMPLETE ---")
    send_chat(f"Mark task {task_id} as complete")
    
    # verify completion
    r_complete = requests.get(f"{API_URL}/api/tasks/{task_id}", headers=headers)
    if r_complete.ok and r_complete.json()["completed"] is True:
        print(f"✅ Task Completion Verified")
    else:
        print(f"❌ COMPLETE verification failed")

    # 5. Delete Task
    print("\n--- Testing DELETE ---")
    send_chat(f"Delete task {task_id}")
    
    # verify deletion
    r_delete = requests.get(f"{API_URL}/api/tasks/{task_id}", headers=headers)
    if r_delete.status_code == 404:
        print(f"✅ Task Deletion Verified")
    else:
        print(f"❌ DELETE verification failed. Status: {r_delete.status_code}")

if __name__ == "__main__":
    test_chatbot_crud()
