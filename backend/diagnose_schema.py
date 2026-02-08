import os
import sys
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load env from current dir (api)
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, '.env'))

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("CRITICAL: No DATABASE_URL found.")
    sys.exit(1)

print(f"Connecting to: {db_url}")

try:
    engine = create_engine(db_url)
    inspector = inspect(engine)
    
    if inspector.has_table("user"):
        columns = inspector.get_columns("user")
        print("\n--- ACTUAL DATABASE COLUMNS ---")
        for col in columns:
            print(f"Column: {col['name']} ({col['type']})")
        print("-------------------------------\n")
    else:
        print("CRITICAL: Table 'user' does not exist.")

except Exception as e:
    print(f"Schema Check Failed: {e}")
