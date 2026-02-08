from sqlmodel import create_engine, Session, SQLModel
from backend.core.config import settings


# Create the database engine with connection pooling for performance
# CRITICAL: Neon DB pooler does NOT support statement_timeout in options
engine = create_engine(
    settings.database_url,
    echo=False,  # Set to True for debugging SQL queries
    pool_pre_ping=True,  # Test connections before use (handles stale connections)
    pool_size=10,  # Number of connections to maintain in the pool
    max_overflow=20,  # Max additional connections beyond pool_size
    pool_recycle=3600,  # Recycle connections after 1 hour (3600 seconds)
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        # NOTE: Removed "options": "-c statement_timeout=30000" 
        # because Neon's transaction pooler doesn't support it
    }
)


def get_session():
    try:
        with Session(engine) as session:
            yield session
    except Exception as e:
        import traceback
        try:
            with open("d:/neontask/db_error.log", "w") as f:
                f.write(traceback.format_exc())
        except:
            print(f"FAILED TO WRITE DB LOG: {e}")
        print(f"DB CONNECTION ERROR: {e}")
        raise e