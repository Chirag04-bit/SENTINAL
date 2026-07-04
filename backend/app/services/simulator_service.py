import os
import time
import random
import json
import threading
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.services import event_service
from app.models.user import User
import logging

logger = logging.getLogger("SENTINEL")

class EventSimulator:
    def __init__(self):
        self._thread = None
        self._stop_event = threading.Event()
        self.is_running = False
        
        # Load datasets for stream ingestion
        self.fraud_df = None
        self.kdd_df = None
        self._load_datasets()

    def _load_datasets(self):
        """Loads data rows for streaming simulation."""
        try:
            fraud_path = os.path.abspath(os.path.join(os.getcwd(), "../ml/datasets/creditcard_downsampled.csv"))
            if os.path.exists(fraud_path):
                self.fraud_df = pd.read_csv(fraud_path)
                logger.info("Simulator loaded creditcard fraud dataset rows.")
            else:
                logger.warning(f"Simulator fraud dataset not found at {fraud_path}")

            kdd_path = os.path.abspath(os.path.join(os.getcwd(), "../ml/datasets/KDDTrain+_20Percent.txt"))
            if os.path.exists(kdd_path):
                kdd_cols = [
                    'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
                    'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
                    'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
                    'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
                    'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
                    'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
                    'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
                    'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
                    'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
                    'dst_host_rerror_rate', 'dst_host_srv_rerror_rate', 'label', 'difficulty_level'
                ]
                self.kdd_df = pd.read_csv(kdd_path, names=kdd_cols, header=None)
                logger.info("Simulator loaded intrusion dataset rows.")
            else:
                logger.warning(f"Simulator intrusion dataset not found at {kdd_path}")
        except Exception as e:
            logger.error(f"Error loading datasets in simulator: {e}")

    def start(self, interval: float = 3.0):
        """Starts the background simulation thread."""
        if self.is_running:
            return
        
        self.is_running = True
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_loop, args=(interval,), daemon=True)
        self._thread.start()
        logger.info("Event simulator started.")

    def stop(self):
        """Stops the background simulation thread."""
        if not self.is_running:
            return
            
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=2.0)
        self.is_running = False
        logger.info("Event simulator stopped.")

    def _run_loop(self, interval: float):
        """Background thread main loop."""
        db: Session = SessionLocal()
        try:
            while not self._stop_event.is_set():
                # 1. Fetch a random user from database
                users = db.query(User).filter(User.role == "user").all()
                if not users:
                    time.sleep(interval)
                    continue
                user = random.choice(users)
                
                # Check user privacy permissions to guarantee opt-in behavior
                try:
                    permissions = json.loads(user.connected_sources or "{}")
                except Exception:
                    permissions = {}
                
                # 2. Select event type: 50% fraud/transaction, 50% intrusion
                event_type = random.choice(["fraud", "intrusion"])
                event_data = {}
                
                # Skip generation if the user has not connected/allowed monitoring for this stream
                if event_type == "fraud" and not (permissions.get("chrome", False) or permissions.get("google_account", False)):
                    time.sleep(interval)
                    continue
                if event_type == "intrusion" and not (permissions.get("wifi", False) or permissions.get("windows_logs", False)):
                    time.sleep(interval)
                    continue
                
                if event_type == "fraud" and self.fraud_df is not None:
                    # Pick a random row
                    idx = random.randint(0, len(self.fraud_df) - 1)
                    row = self.fraud_df.iloc[idx]
                    
                    event_data = {
                        "type": "transaction" if row["Class"] == 0 else "fraud",
                        "ip_address": f"192.168.1.{random.randint(2, 254)}",
                        "location": random.choice(["Mumbai, India", "Delhi, India", "Lagos, Nigeria", "So Paulo, Brazil", "London, United Kingdom"]),
                        "device": random.choice(["Chrome / Windows 11", "Safari / iOS", "Firefox / Linux", "Unknown Device"]),
                        "amount": float(row["Amount"]),
                        "merchant": random.choice(["Amazon", "Swiggy", "Netflix", "Google", "Flipkart"]),
                        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
                    }
                    
                    # Pass the raw PCA variables in event_data for ML service
                    for col in self.fraud_df.columns:
                        if col.startswith("V"):
                            event_data[col] = float(row[col])
                            
                elif event_type == "intrusion" and self.kdd_df is not None:
                    idx = random.randint(0, len(self.kdd_df) - 1)
                    row = self.kdd_df.iloc[idx]
                    
                    # Map attack types to friendly names
                    label = str(row["label"])
                    is_anomaly = label != "normal"
                    
                    event_data = {
                        "type": "intrusion" if is_anomaly else "system",
                        "ip_address": f"10.0.0.{random.randint(2, 254)}",
                        "location": random.choice(["New York, United States", "Beijing, China", "Moscow, Russia", "Bucharest, Romania"]),
                        "device": "Security Router Node",
                        "amount": 0.0,
                        "merchant": "Network NIC",
                        "user_agent": "Packet Stream Ingest"
                    }
                    
                    # Pass network traffic columns to event_data
                    for col in self.kdd_df.columns:
                        if col not in ["label", "difficulty_level", "target"]:
                            # Handle numeric / categorical mapping
                            val = row[col]
                            if isinstance(val, (int, float)):
                                event_data[col] = float(val)
                            else:
                                event_data[col] = str(val)
                else:
                    # Generic system event fallback
                    event_data = {
                        "type": "system",
                        "ip_address": "127.0.0.1",
                        "location": "Local Datacenter",
                        "device": "Daemon Ingest",
                        "amount": 0.0,
                        "merchant": "Sentinel Core"
                    }

                # 3. Ingest the event via service
                try:
                    event_service.ingest_event(db, user.id, event_data)
                    logger.info(f"Simulated live {event_data['type']} event for user {user.name}")
                except Exception as ex:
                    logger.error(f"Simulator failed to ingest event: {ex}")
                
                # 4. Wait for interval before next event
                time.sleep(interval)
        except Exception as e:
            logger.error(f"Exception in simulator run loop: {e}")
        finally:
            db.close()

# Single global instance of simulator
event_simulator = EventSimulator()
