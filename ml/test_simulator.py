import time
import requests

BASE_URL = "http://localhost:8000"

print("--- Testing SENTINEL Live Simulator Stream ---")

# 1. Login
login_url = f"{BASE_URL}/auth/login"
credentials = {
    "email": "admin@sentinel.ai",
    "password": "Password@1234"
}
try:
    print(f"Logging in to {login_url}...")
    res = requests.post(login_url, json=credentials)
    res.raise_for_status()
    data = res.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful. Received JWT token.")
except Exception as e:
    print(f"FAILED to login: {e}")
    exit(1)

# 2. Check current simulator status
try:
    status_res = requests.get(f"{BASE_URL}/events/simulator/status", headers=headers)
    print("Initial Simulator Status:", status_res.json())
except Exception as e:
    print(f"FAILED to fetch simulator status: {e}")

# 3. Start Simulator
try:
    print("\nStarting live event simulator (interval = 3 seconds)...")
    start_res = requests.post(f"{BASE_URL}/events/simulator/start", headers=headers)
    print("Start Response:", start_res.json())
except Exception as e:
    print(f"FAILED to start simulator: {e}")
    exit(1)

# 4. Wait for events to ingest
wait_seconds = 8
print(f"Waiting for {wait_seconds} seconds to allow the simulator to ingest events...")
time.sleep(wait_seconds)

# 5. Fetch recently ingested events to prove live ML risk scoring worked
try:
    print("\nFetching latest ingested events...")
    events_res = requests.get(f"{BASE_URL}/events/?page=1&limit=5", headers=headers)
    events_res.raise_for_status()
    events = events_res.json()["data"]
    
    print(f"Successfully retrieved {len(events)} recent events:")
    for idx, ev in enumerate(events):
        print(f"  [{idx+1}] Type: {ev['type']} | Risk Score: {ev['risk_score']}/100 | Risk Level: {ev['risk_level']} | IP: {ev['ip_address']} | Time: {ev['timestamp']}")
except Exception as e:
    print(f"FAILED to fetch recent events: {e}")

# 6. Stop Simulator
try:
    print("\nStopping live event simulator...")
    stop_res = requests.post(f"{BASE_URL}/events/simulator/stop", headers=headers)
    print("Stop Response:", stop_res.json())
except Exception as e:
    print(f"FAILED to stop simulator: {e}")

# 7. Check final simulator status
try:
    status_res = requests.get(f"{BASE_URL}/events/simulator/status", headers=headers)
    print("Final Simulator Status:", status_res.json())
except Exception as e:
    print(f"FAILED to fetch simulator status: {e}")

print("\nSimulator test completed successfully!")
