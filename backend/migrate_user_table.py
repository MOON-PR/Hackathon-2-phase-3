import sys
import os
from sqlalchemy import create_engine, text

# Ensure we can import from local modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from backend.core.config import settings

def migrate_user():
    print(f"🔌 Connecting to database to fix 'user' table...")
    # Using the settings from config directly
    db_url = settings.database_url
    print(f"Target: {db_url.split('@')[1] if '@' in db_url else 'LOCAL'}")

    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        print("🛠️  Adding 'password_hash' column to 'user' table...")
        try:
            # Check if column exists first or just try add
            conn.execute(text("ALTER TABLE \"user\" ADD COLUMN password_hash TEXT"))
            conn.commit()
            print("✅ Added column password_hash")
        except Exception as e:
            if "already exists" in str(e):
                 print("⚠️ Column 'password_hash' already exists.")
            else:
                print(f"❌ Failed to add column: {e}")

        # Try to add other potential missing columns just in case
        columns_to_check = [
            ("emailVerified", "BOOLEAN DEFAULT FALSE"),
            ("createdAt", "TIMESTAMP"),
            ("updatedAt", "TIMESTAMP")
        ]
        
        for col, dtype in columns_to_check:
            try:
                # Quote column names to handle camelCase if that's what we want
                conn.execute(text(f"ALTER TABLE \"user\" ADD COLUMN \"{col}\" {dtype}"))
                conn.commit()
                print(f"✅ Added column {col}")
            except Exception as e:
                pass # Silent fail if exists

if __name__ == "__main__":
    try:
        migrate_user()
        print("\n🎉 User migration script finished.")
    except Exception as e:
        print(f"\n❌ Migration script failed cleanly: {e}")
