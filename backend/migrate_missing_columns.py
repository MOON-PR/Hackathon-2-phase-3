from sqlalchemy import create_engine, text
import os
import sys

# Get DB URL from env
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print("DATABASE_URL not set!")
    sys.exit(1)

# Ensure consistent connection params
if "channel_binding=require" in DB_URL:
    print("Removing channel_binding=require for migration stability...")
    DB_URL = DB_URL.replace("&channel_binding=require", "")

def migrate_columns():
    print(f"Connecting to DB: {DB_URL.split('@')[1]}")
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        try:
            print("Migrating columns...")
            # Add all columns that might be missing
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;')) # Boolean
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS image TEXT;'))
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;'))
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;'))
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS name TEXT;'))
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password_hash TEXT;'))
            
            conn.commit()
            print("Migration successful.")
        except Exception as e:
            print(f"Error executing migration: {e}")
            # Try to print more info if possible
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    migrate_columns()
