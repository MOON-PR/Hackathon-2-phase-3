import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load env manually to be sure
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up one level to api root
root_dir = os.path.dirname(current_dir) 
# Actually current_dir IS e:\todo-hackathon\api, so looks like we are in root
load_dotenv(os.path.join(current_dir, '.env'))

db_url = os.getenv("DATABASE_URL")
print(f"Testing DB connectivity for: {db_url}")

if not db_url:
    print("ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"Connection Successful! Result: {result.scalar()}")
except Exception as e:
    print("----------------------------------------------------------------")
    print("CONNECTION FAILED:")
    print(e)
    print("----------------------------------------------------------------")
