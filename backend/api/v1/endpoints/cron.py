from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import List, Optional
import requests
import json

from backend.database.session import get_session
from backend.models.task import Task
from backend.core.config import settings

router = APIRouter()

DAPR_HTTP_PORT = 3500
PUBSUB_NAME = "todo-pubsub"
NOTIFICATIONS_TOPIC = "notifications"

@router.post("/check-reminders")
def check_reminders(db: Session = Depends(get_session)):
    """
    Called by Dapr Cron Binding every 5 minutes.
    Checks for tasks due in the next 15 minutes.
    """
    print("⏰ Cron Job: Checking for reminders...")
    
    # Logic: due_date <= now + 15 mins AND notification_sent = False AND status = pending
    now = datetime.now()
    threshold = now + timedelta(minutes=15)
    
    # We'll fetch all pending un-notified tasks and filter by date in Python for simplicity with strings
    # Or strict SQL query if dates are ISO sorted
    statement = select(Task).where(
        Task.completed == False,
        Task.notification_sent == False,
        Task.due_date != None
    )
    tasks = db.exec(statement).all()
    
    reminders_sent = 0
    
    for task in tasks:
        try:
            due_at = datetime.fromisoformat(task.due_date)
            # Check if overdue or due soon
            if due_at <= threshold:
                # Publish Event
                payload = {
                    "type": "reminder",
                    "user_id": task.user_id,
                    "task_id": task.id,
                    "title": f"Reminder: {task.description}",
                    "body": f"This task is due at {task.due_date}!"
                }
                
                publish_url = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{NOTIFICATIONS_TOPIC}"
                try:
                    requests.post(publish_url, json=payload, timeout=2)
                    
                    # Mark as sent
                    task.notification_sent = True
                    db.add(task)
                    reminders_sent += 1
                    print(f"   🔔 Sent reminder for task {task.id}")
                except Exception as e:
                    print(f"   ❌ Failed to publish reminder: {e}")

        except ValueError:
            continue # Skip bad date formats
            
    if reminders_sent > 0:
        db.commit()
    
    return {"status": "ok", "reminders_sent": reminders_sent}
