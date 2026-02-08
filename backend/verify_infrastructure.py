import requests
import time
import sys

DAPR_HTTP_PORT = 3500 # Default
PUBSUB_NAME = "todo-pubsub"
TOPIC_NAME = "task-events"

def verify_dapr():
    print("🧪 Verifying Dapr Infrastructure...")
    
    # 1. Check Dapr Sidecar Health
    dapr_url = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/healthz"
    try:
        print(f"   Connecting to Dapr at {dapr_url}...")
        resp = requests.get(dapr_url, timeout=5)
        if resp.status_code == 204:
            print("   ✅ Dapr Sidecar is healthy.")
        else:
            print(f"   ❌ Dapr Sidecar returned {resp.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Could not connect to Dapr: {e}")
        print("   (Make sure you are running the backend with 'dapr run ...')")
        return False

    # 2. Check Pub/Sub Component
    # We can try to publish a message. If Redpanda is down or config is wrong, this should fail.
    publish_url = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{TOPIC_NAME}"
    payload = {
        "event_type": "infrastructure_verification",
        "timestamp": str(time.time())
    }
    
    try:
        print(f"   Publishing test event to {PUBSUB_NAME}/{TOPIC_NAME}...")
        resp = requests.post(publish_url, json=payload, timeout=5)
        if resp.status_code == 204:
            print("   ✅ Successfully published event to Redpanda via Dapr.")
        else:
            print(f"   ❌ Publish failed: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        print(f"   ❌ Publish exception: {e}")
        return False

    print("🎉 Infrastructure Verification Passed!")
    return True

if __name__ == "__main__":
    if not verify_dapr():
        sys.exit(1)
