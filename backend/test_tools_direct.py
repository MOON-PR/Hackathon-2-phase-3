import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.session import get_session
from backend.services.task_service import TaskService
from backend.repositories.task_repository import TaskRepository
from backend.api.v1.endpoints.chat import execute_tool

def test_tool_logic():
    print("--- Testing Tool Logic Directly ---")
    
    # Setup dependencies
    session = next(get_session())
    task_service = TaskService(TaskRepository())
    user_id = "test_manual_user_123"

    # 1. Add Task
    print("\n1. Testing add_task...")
    res = execute_tool("add_task", {"title": "Manual Tool Test", "priority": "high"}, session, user_id, task_service)
    print(f"Result: {res}")
    
    # Verify via service
    tasks = task_service.get_all_tasks(session, user_id)
    created_task = next((t for t in tasks if t.description == "Manual Tool Test"), None)
    if created_task:
        print(f"✅ Created Task ID: {created_task.id}")
    else:
        print("❌ Task not found in DB")
        return

    # 2. List Tasks
    print("\n2. Testing list_tasks...")
    res = execute_tool("list_tasks", {"status": "all"}, session, user_id, task_service)
    print(f"Result: {res[:50]}...") # Print first 50 chars
    
    # 3. Update Task
    print("\n3. Testing update_task...")
    res = execute_tool("update_task", {"task_id": created_task.id, "new_title": "Updated Manual Test"}, session, user_id, task_service)
    print(f"Result: {res}")
    
    session.refresh(created_task)
    if created_task.description == "Updated Manual Test":
        print("✅ Task Updated in DB")
    else:
        print("❌ Update failed in DB")

    # 4. Complete Task
    print("\n4. Testing complete_task...")
    res = execute_tool("complete_task", {"task_id": created_task.id}, session, user_id, task_service)
    print(f"Result: {res}")
    
    session.refresh(created_task)
    if created_task.completed:
        print("✅ Task Completed in DB")
    else:
        print("❌ Completion failed in DB")

    # 5. Delete Task
    print("\n5. Testing delete_task...")
    res = execute_tool("delete_task", {"task_id": created_task.id}, session, user_id, task_service)
    print(f"Result: {res}")
    
    deleted_task = session.get(created_task.__class__, created_task.id)
    if not deleted_task:
        print("✅ Task Deleted from DB")
    else:
        print("❌ Deletion failed in DB")

if __name__ == "__main__":
    try:
        test_tool_logic()
    except Exception as e:
        print(f"Exception: {e}")
