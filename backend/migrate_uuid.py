from sqlmodel import Session, text
from backend.database.session import engine

def add_uuid_column():
    with Session(engine) as session:
        try:
            # 1. Add the column (nullable first to avoid issues with existing data, then backfill)
            # PostgreSQL specific syntax
            print("Adding session_id column...")
            session.exec(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT gen_random_uuid();"))
            
            # 2. Make it unique and not null
            print("Adding constraints...")
            # session.exec(text("UPDATE conversations SET session_id = gen_random_uuid() WHERE session_id IS NULL;")) # Default handles this
            # session.exec(text("ALTER TABLE conversations ALTER COLUMN session_id SET NOT NULL;"))
            session.exec(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);"))
            
            session.commit()
            print("Migration successful: session_id added.")
        except Exception as e:
            session.rollback()
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    add_uuid_column()
