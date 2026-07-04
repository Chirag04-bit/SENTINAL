import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.services.ml_service import ml_service

print("--- Testing ML Service Inferences Offline ---")
print("Models loaded:", ml_service.models_loaded)

if not ml_service.models_loaded:
    print("ERROR: Models not loaded. Check paths.")
    exit(1)

# 1. Test Intrusion Model
print("\nTesting Intrusion Model with normal network connection...")
normal_traffic = {
    "protocol_type": "tcp",
    "service": "http",
    "flag": "SF",
    "src_bytes": 150.0,
    "dst_bytes": 350.0,
    "logged_in": 1.0,
    "count": 2.0,
    "serror_rate": 0.0,
    "rerror_rate": 0.0,
    "same_srv_rate": 1.0
}
score, level, factors, rec = ml_service.predict_intrusion(normal_traffic)
print(f"Normal packet -> Score: {score}/100, Level: {level}")
print(f"Explainability Factors: {factors}")

print("\nTesting Intrusion Model with malicious port scan / anomaly connection...")
anomalous_traffic = {
    "protocol_type": "icmp",
    "service": "eco_i",
    "flag": "RSTR",
    "src_bytes": 0.0,
    "dst_bytes": 0.0,
    "logged_in": 0.0,
    "count": 250.0,
    "serror_rate": 1.0,
    "rerror_rate": 1.0,
    "same_srv_rate": 0.05
}
score, level, factors, rec = ml_service.predict_intrusion(anomalous_traffic)
print(f"Malicious packet -> Score: {score}/100, Level: {level}")
print(f"Explainability Factors: {factors}")
