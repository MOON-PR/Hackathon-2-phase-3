import logging

# Setup Logger
logger = logging.getLogger("notification-consumer")

def process_notification(event_data: dict):
    """
    Handles 'SendNotification' events.
    """
    logger.info(f"🔔 RECEIVED NOTIFICATION EVENT: {event_data}")
    
    # In a real app, this would send Email/Push/SMS
    # For now, just logging is sufficient for verification
    
    title = event_data.get("title", "Task Reminder")
    body = event_data.get("body", "")
    user_id = event_data.get("user_id")
    
    print(f"------------[ MOCK NOTIFICATION ]------------")
    print(f"To: {user_id}")
    print(f"Subject: {title}")
    print(f"Body: {body}")
    print(f"---------------------------------------------")
