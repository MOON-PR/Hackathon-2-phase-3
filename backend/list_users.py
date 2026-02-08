from sqlmodel import Session, select
from backend.models.user import User
from backend.database.session import engine

def list_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"ID: {user.id}, Email: {user.email}, Name: {user.name}, HasPwd: {bool(user.password_hash)}")

if __name__ == "__main__":
    list_users()
