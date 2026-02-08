from sqlmodel import Session, select
from backend.models.user import User
from backend.database.session import engine
from passlib.context import CryptContext
from datetime import datetime
import uuid

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def create_test_user():
    with Session(engine) as session:
        # Check if exists
        user = session.exec(select(User).where(User.email == "ali@gmail.com")).first()
        if user:
            print(f"User ali@gmail.com already exists. ID: {user.id}")
            # Reset password to 'password'
            user.password_hash = pwd_context.hash("password")
            session.add(user)
            session.commit()
            print("Password reset to 'password'")
            return

        # Create new
        new_user = User(
            id=str(uuid.uuid4()),
            email="ali@gmail.com",
            name="Ali User",
            password_hash=pwd_context.hash("password"),
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
            emailVerified=True
        )
        session.add(new_user)
        session.commit()
        print(f"Created user ali@gmail.com with password 'password'")

if __name__ == "__main__":
    create_test_user()
