import psycopg2
import os

DB_URL = "postgresql://neondb_owner:npg_M7QirkT8XaPF@ep-jolly-water-ai385sfa-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def test_ssl_connection():
    print(f"Connecting to: {DB_URL.split('@')[1]}")
    try:
        conn = psycopg2.connect(DB_URL)
        print("Connection successful with sslmode=require & channel_binding=require")
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")
        
    # Try without channel binding
    DB_URL_NO_BIND = DB_URL.replace("&channel_binding=require", "")
    print(f"Connecting to: {DB_URL_NO_BIND.split('@')[1]}")
    try:
        conn = psycopg2.connect(DB_URL_NO_BIND)
        print("Connection successful WITHOUT channel_binding")
        conn.close()
    except Exception as e:
        print(f"Connection failed without channel_binding: {e}")

if __name__ == "__main__":
    test_ssl_connection()
