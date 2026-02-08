from sqlmodel import SQLModel, create_engine, Session
from backend.models.user import User
import os

# Use local SQLite for testing
DATABASE_URL = "sqlite:///./dev_db.sqlite"
engine = create_engine(DATABASE_URL)

def test_sqlite():
    print(f"Testing SQLite connection to {DATABASE_URL}...")
    try:
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully.")
        with Session(engine) as session:
            print("Session created.")
            # Verify User table exists
            users = session.query(User).all()
            print(f"User count: {len(users)}")
    except Exception as e:
        print(f"SQLite Test Failed: {e}")

if __name__ == "__main__":
    test_sqlite()
