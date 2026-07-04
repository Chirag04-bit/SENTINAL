import requests

BASE_URL = "http://localhost:8000"

print("--- Activating Live Ingestion Simulator ---")

# 1. Login
login_url = f"{BASE_URL}/auth/login"
credentials = {
    "email": "admin@sentinel.ai",
    "password": "Password@1234"
}

try:
    print("Logging in to obtain JWT access token...")
    res = requests.post(login_url, json=credentials)
    res.raise_for_status()
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")
except Exception as e:
    print(f"Failed to log in: {e}")
    exit(1)

# 2. Trigger Start
try:
    print("Sending POST request to start background event simulator...")
    start_res = requests.post(f"{BASE_URL}/events/simulator/start", headers=headers)
    start_res.raise_for_status()
    print("Simulator successfully activated!")
    print("Response payload:", start_res.json())
except Exception as e:
    print(f"Failed to start simulator: {e}")
