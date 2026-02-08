import psycopg2
import os

# Connection string from user/env
DB_URL = "postgresql://neondb_owner:npg_M7QirkT8XaPF@ep-jolly-water-ai385sfa-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def test_neon_connection():
    print(f"Connecting to Neon DB: {DB_URL.split('@')[1]}")
    try:
        conn = psycopg2.connect(DB_URL)
        print("Connection successful!")
        
        cur = conn.cursor()
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cur.fetchall()
        print(f"Tables found: {[t[0] for t in tables]}")
        
        if ('user',) in tables or ('User',) in tables:
            print("Querying users...")
            cur.execute('SELECT "email", "name" FROM "user";') # Quote table name just in case
            users = cur.fetchall()
            print(f"Users found ({len(users)}):")
            for u in users:
                print(u)
        else:
            print("User table not found.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_neon_connection()
