import sys
import os
from datetime import datetime, timezone

# Add root to sys.path to allow imports from top-level api package if needed
sys.path.append(os.getcwd())

from sqlmodel import Session, select, create_engine
# Adjust imports assuming we are running from root, so 'api.models' if 'api' is not in path as package root
# But since we run `python api/debug...`, 'api' dir is in path.
try:
    from models.user import User
    from api.v1.endpoints.auth import hash_password
except ImportError:
    # Fallback if running from root with module style
    from api.models.user import User
    from api.api.v1.endpoints.auth import hash_password

# Get DB URL from env or use default
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print("DATABASE_URL not set!")
    sys.exit(1)

# Test without channel binding to see if it fixes stability
if "channel_binding=require" in DB_URL:
    print("Removing channel_binding=require for test...")
    DB_URL = DB_URL.replace("&channel_binding=require", "")

engine = create_engine(DB_URL, echo=True)

def create_test_user_debug():
    print(f"Connecting to DB: {DB_URL.split('@')[1]}")
    try:
        with Session(engine) as session:
            print("Session created.")
            email = "test@example.com"
            
            print(f"Checking for user: {email}")
            try:
                # Try raw SQL first to debug driver
                from sqlalchemy import text
                print("Trying raw SQL select...")
                result = session.exec(text("SELECT * FROM \"user\" WHERE email = :email"), params={"email": email}).first()
                print(f"Raw SQL result: {result}")

                # Query strictly
                stmt = select(User).where(User.email == email)
                print(f"Statement: {stmt}")
                existing_user = session.exec(stmt).first()
                print(f"Query result: {existing_user}")
            except Exception as e:
                print(f"Select failed: {e}")
                if hasattr(e, 'orig'):
                    print(f"Original error: {e.orig}")
                import traceback
                traceback.print_exc()
                return

            if existing_user:
                print(f"User already exists: {existing_user}")
                # Update password
                existing_user.password_hash = hash_password("password123")
                session.add(existing_user)
                session.commit()
                print("Password updated.")
            else:
                print("Creating new user...")
                new_user = User(
                    id="test-user-id-123",
                    email=email,
                    name="Test User",
                    password_hash=hash_password("password123"),
                    email_verified=True,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                session.add(new_user)
                session.commit()
                print("User created.")
                
    except Exception as e:
        print(f"Process failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_test_user_debug()
