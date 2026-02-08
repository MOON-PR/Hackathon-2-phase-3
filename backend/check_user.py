from sqlmodel import Session, select, create_engine
from backend.models.user import User
from backend.database.session import engine

# Create a session
with Session(engine) as session:
    user = session.exec(select(User).where(User.email == "ali@gmail.com")).first()
    if user:
        print(f"User found: {user.email}, ID: {user.id}")
        if user.password_hash:
            print("User has password hash.")
        else:
            print("User has NO password hash.")
    else:
        print("User ali@gmail.com NOT found.")
