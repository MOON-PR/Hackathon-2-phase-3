from sqlalchemy import create_engine, text
import os

# Use local env for connection string or hardcode for now
DB_URL = "postgresql://neondb_owner:npg_M7QirkT8XaPF@ep-jolly-water-ai385sfa-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def add_password_hash_column():
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        try:
            print("Attempting to add password_hash column...")
            conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password_hash VARCHAR;'))
            conn.commit()
            print("Column added successfully or already exists.")
        except Exception as e:
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_password_hash_column()
