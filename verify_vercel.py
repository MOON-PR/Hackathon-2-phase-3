import sys
import os

# Ensure we can import from the current directory
sys.path.insert(0, os.getcwd())
sys.path.insert(0, os.path.join(os.getcwd(), 'api'))

print("🔄 Attempting to import handler from api.index...")

try:
    from api.index import handler, app
    print(f"✅ Import Successful!")
    print(f"Type of handler: {type(handler)}")
    print(f"Type of app: {type(app)}")
    
    from fastapi import FastAPI
    if isinstance(handler, FastAPI):
        print("✅ Handler IS a FastAPI instance.")
    else:
        print("❌ Handler is NOT a FastAPI instance!")
        
except Exception as e:
    print(f"❌ CRITICAL IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
