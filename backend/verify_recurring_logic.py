import requests
import time
from datetime import datetime, timedelta
import sys
import os

# Helper to look into DB
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlmodel import Session, select
from backend.database.session import engine
from backend.models.task import Task

DAPR_HTTP_PORT = 3500
PUBSUB_NAME = "todo-pubsub"
TOPIC_EVENTS = "task-events"
TOPIC_NOTIFICATIONS = "notifications"

def verify():
    print("🧪 Verifying Recurring Task & Reminders...")
    
    with Session(engine) as db:
        # 1. Setup Test Data: Recurring Task
        print("   Creating test recurring task in DB...")
        test_task = Task(
            description="Test Recurring Task",
            user_id="test_user",
            is_recurring=True,
            recurrence_pattern="daily",
            due_date=datetime.now().isoformat(),
            priority="High",
            notification_sent=False
        )
        db.add(test_task)
        db.commit()
        db.refresh(test_task)
        task_id = test_task.id
        print(f"   ✅ Created Task ID {task_id}")

        # 2. Simulate Completion Event (Publish to Dapr)
        print("   Simulating 'task-completed' event via Dapr...")
        payload = {
            "event_type": "completed",
            "task_id": task_id,
            "user_id": "test_user",
            "timestamp": str(time.time()),
            "data": test_task.model_dump()
        }
        
        try:
            resp = requests.post(
                f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{TOPIC_EVENTS}",
                json=payload,
                timeout=2
            )
            if resp.status_code == 204:
                print("   ✅ Event Published (204)")
            else:
                print(f"   ❌ Event Publish Failed: {resp.status_code}")
        except Exception as e:
            print(f"   ❌ Event Publish Error: {e}")

        # 3. Wait for Consumer to Process
        print("   Waiting 3s for consumer...")
        time.sleep(3)
        
        # 4. Check for New Task
        db.expire_all() # Refresh
        # Look for a task with same description but different ID and newly created
        new_tasks = db.exec(select(Task).where(
            Task.description == "Test Recurring Task",
            Task.id != task_id,
            Task.is_recurring == True
        )).all()
        
        if len(new_tasks) > 0:
            new_t = new_tasks[-1]
            print(f"   ✅ FOUND NEW TASK: ID {new_t.id}, Due: {new_t.due_date}")
        else:
            print("   ❌ NO NEW TASK FOUND (Recurrence failed)")

        # 5. Test Reminder Endpoint
        print("\n   Testing Reminder Cron Endpoint...")
        # Create a task due soon (now)
        reminder_task = Task(
            description="Test Reminder Task",
            user_id="test_user",
            due_date=datetime.now().isoformat(),
            notification_sent=False,
            completed=False
        )
        db.add(reminder_task)
        db.commit()
        
        try:
            resp = requests.post("http://localhost:8000/api/cron/check-reminders", timeout=2)
            print(f"   Cron Response: {resp.json()}")
            
            db.refresh(reminder_task)
            if reminder_task.notification_sent:
                print("   ✅ Task marked as notification_sent=True")
                # Can't easily check stdout of backend here, but the DB update is proof
            else:
                print("   ❌ Task NOT marked as notification_sent")
                
        except Exception as e:
             print(f"   ❌ Cron Error: {e}")

if __name__ == "__main__":
    verify()
