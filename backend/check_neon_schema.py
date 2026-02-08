import psycopg2
import os

DB_URL = "postgresql://neondb_owner:npg_M7QirkT8XaPF@ep-jolly-water-ai385sfa-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def check_columns():
    print(f"Connecting to: {DB_URL.split('@')[1]}")
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        print("Checking for 'user' tables in ALL schemas...")
        cur.execute("""
            SELECT table_schema, table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'user' OR table_name = 'User';
        """)
        columns = cur.fetchall()
        
        print(f"{'Schema':<15} {'Table':<15} {'Column':<20} {'Type':<15}")
        print("-" * 65)
        for col in columns:
            print(f"{col[0]:<15} {col[1]:<15} {col[2]:<20} {col[3]:<15}")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Connection/Query failed: {e}")

if __name__ == "__main__":
    check_columns()
