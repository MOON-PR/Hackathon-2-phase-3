from sqlmodel import SQLModel
from backend.database.session import engine
# Explicitly import models to register them with metadata
from backend.models.user import User
from backend.models.task import Task
from backend.models.conversation import Conversation
from backend.models.chat_message import ChatMessage

def init_db():
    print("Initializing database...")
    try:
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    init_db()
