import requests

BASE_URL = "http://localhost:8000"

# 1. Login
login_url = f"{BASE_URL}/auth/login"
credentials = {
    "email": "admin@sentinel.ai",
    "password": "Password@1234"
}

try:
    res = requests.post(login_url, json=credentials)
    res.raise_for_status()
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
except Exception as e:
    print(f"Login failed: {e}")
    exit(1)

# 2. Fetch latest events
try:
    events_res = requests.get(f"{BASE_URL}/events/?page=1&limit=10", headers=headers)
    events_res.raise_for_status()
    events = events_res.json()["data"]
    
    print("\n--- Latest 10 Live Events ---")
    for idx, ev in enumerate(events):
        print(f"[{idx+1}] Type: {ev['type']:12} | Risk Score: {ev['risk_score']:3}/100 | Risk Level: {ev['risk_level']:8} | Location: {ev['location']:25} | Device: {ev['device']}")
except Exception as e:
    print(f"Failed to fetch events: {e}")
