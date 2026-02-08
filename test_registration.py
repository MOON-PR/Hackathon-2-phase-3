#!/usr/bin/env python3
"""
Test registration endpoint to see actual errors
"""
import requests
import json
import sys
from datetime import datetime

# Test with local backend
BASE_URL = "http://localhost:8000"
SIGNUP_URL = f"{BASE_URL}/api/auth/signup"

def test_registration():
    """Test user registration"""
    test_data = {
        "email": f"testuser_{datetime.now().timestamp()}@example.com",
        "password": "TestPassword123!",
        "name": "Test User"
    }
    
    print(f"Testing registration with data: {json.dumps(test_data, indent=2)}")
    print(f"URL: {SIGNUP_URL}")
    print("-" * 60)
    
    try:
        response = requests.post(
            SIGNUP_URL,
            json=test_data,
            timeout=10,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response Body:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code != 200:
            print(f"\n[ERROR] Registration failed with status {response.status_code}")
            return False
        else:
            print(f"\n[SUCCESS] Registration successful!")
            return True
            
    except requests.exceptions.ConnectionError as e:
        print(f"[ERROR] Connection failed: {e}")
        print("Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_registration()
    sys.exit(0 if success else 1)
