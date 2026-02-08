import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load env
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, '.env'))

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL")
    sys.exit(1)

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("Cleaning up test user 'testuser_brother@gmail.com'...")
        # Quote "user" because it is a reserved word in Postgres
        conn.execute(text("DELETE FROM \"user\" WHERE email = 'testuser_brother@gmail.com'"))
        conn.commit()
        print("User deleted successfully. You can now Signup again.")

except Exception as e:
    print(f"Error resetting user: {e}")
