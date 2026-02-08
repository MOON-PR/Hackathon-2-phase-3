import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect

# Load env
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, '.env'))

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL")
    sys.exit(1)

try:
    engine = create_engine(db_url)
    inspector = inspect(engine)
    
    if inspector.has_table("user"):
        print("Table 'user' exists.")
        columns = [col['name'] for col in inspector.get_columns("user")]
        print(f"Columns: {columns}")
        
        if "password_hash" not in columns:
            print("CRITICAL: 'password_hash' column is MISSING!")
        else:
            print("OK: 'password_hash' column exists.")
    else:
        print("Table 'user' does NOT exist.")

except Exception as e:
    print(f"Error: {e}")
