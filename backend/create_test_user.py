from sqlmodel import Session, select
from backend.models.user import User
from backend.database.session import engine
from passlib.context import CryptContext
from datetime import datetime
import uuid

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def create_test_user():
    email = "test@example.com"
    password = "password123"
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user:
            print(f"User {email} already exists. Updating password.")
            user.password_hash = pwd_context.hash(password)
            session.add(user)
            session.commit()
            print("Password updated.")
        else:
            print(f"Creating user {email}...")
            new_user = User(
                id=str(uuid.uuid4()),
                email=email,
                name="Test User",
                password_hash=pwd_context.hash(password),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                email_verified=True
            )
            session.add(new_user)
            session.commit()
            print("User created.")

if __name__ == "__main__":
    create_test_user()
