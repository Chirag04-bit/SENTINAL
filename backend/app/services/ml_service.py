import os
import pickle
import numpy as np
import pandas as pd
from typing import Optional, Tuple, List, Dict, Any
from app.config.settings import settings
import logging

logger = logging.getLogger("SENTINEL")

class MLService:
    def __init__(self):
        self.fraud_model = None
        self.fraud_scaler = None
        self.fraud_features = []
        
        self.intrusion_model = None
        self.intrusion_scaler = None
        self.intrusion_features = []
        self.intrusion_numeric_features = []
        self.protocol_map = {}
        self.flag_map = {}
        self.service_map = {}
        
        self.models_loaded = False
        self.load_models()

    def load_models(self):
        """Loads pickled models and scalers into memory."""
        try:
            fraud_path = settings.FRAUD_MODEL_PATH
            # Resolve relative path if needed
            if not os.path.isabs(fraud_path):
                # Assumes running from backend directory
                fraud_path = os.path.abspath(os.path.join(os.getcwd(), fraud_path))
                
            if os.path.exists(fraud_path):
                with open(fraud_path, "rb") as f:
                    fraud_data = pickle.load(f)
                self.fraud_model = fraud_data["model"]
                self.fraud_scaler = fraud_data["scaler"]
                self.fraud_features = fraud_data["features"]
                logger.info("Successfully loaded Fraud ML Model.")
            else:
                logger.warning(f"Fraud model pickle not found at {fraud_path}")

            intrusion_path = settings.INTRUSION_MODEL_PATH
            if not os.path.isabs(intrusion_path):
                intrusion_path = os.path.abspath(os.path.join(os.getcwd(), intrusion_path))
                
            if os.path.exists(intrusion_path):
                with open(intrusion_path, "rb") as f:
                    intrusion_data = pickle.load(f)
                self.intrusion_model = intrusion_data["model"]
                self.intrusion_scaler = intrusion_data["scaler"]
                self.intrusion_features = intrusion_data["features"]
                self.intrusion_numeric_features = intrusion_data["numeric_features"]
                self.protocol_map = intrusion_data["protocol_map"]
                self.flag_map = intrusion_data["flag_map"]
                self.service_map = intrusion_data["service_map"]
                logger.info("Successfully loaded Intrusion ML Model.")
            else:
                logger.warning(f"Intrusion model pickle not found at {intrusion_path}")
                
            if self.fraud_model is not None and self.intrusion_model is not None:
                self.models_loaded = True
                
        except Exception as e:
            logger.error(f"Error loading ML models: {e}", exc_info=True)

    def predict_fraud(self, amount: float, raw_features: Dict[str, Any]) -> Tuple[int, str, List[Dict[str, Any]], str]:
        """
        Runs ML prediction for credit card fraud.
        Returns:
            - score: 0-100 risk score
            - level: low | medium | high | critical
            - factors: explanation details list
            - recommendation: actionable guidance
        """
        if self.fraud_model is None:
            raise RuntimeError("Fraud model not loaded.")

        # Reconstruct standard feature vector. 
        # Raw features might supply pre-calculated PCA variables V1-V28, or we fallback to random PCA signatures
        # of suitable distributions if they don't exist to simulate live inputs
        features_dict = {}
        for feat in self.fraud_features:
            if feat == "Amount":
                features_dict["Amount"] = amount
            else:
                # Retrieve V1-V28 or generate a baseline small noise value
                features_dict[feat] = float(raw_features.get(feat, np.random.normal(0, 0.5)))

        # Create DataFrame
        df_feats = pd.DataFrame([features_dict])[self.fraud_features]
        df_scaled = df_feats.copy()
        df_scaled["Amount"] = self.fraud_scaler.transform(df_feats[["Amount"]])
        
        # Predict probability
        prob = self.fraud_model.predict_proba(df_scaled)[0][1]
        score = int(prob * 100)
        
        # Determine level
        if score <= 30:
            level = "low"
        elif score <= 60:
            level = "medium"
        elif score <= 80:
            level = "high"
        else:
            level = "critical"
            
        # Recommendations
        recommendations = {
            "low": "Legitimate transaction signature. No action required.",
            "medium": "Notify user of unusual transaction amount; request confirmation.",
            "high": "Temporarily hold transaction. Authenticate user identity.",
            "critical": "Block transaction immediately. Suspend card and initiate security protocol."
        }
        
        # Calculate feature contributions for explainability (SHAP approximation)
        # We look at the most important features in the RF model and check how much the scaled input deviates
        importances = self.fraud_model.feature_importances_
        factors = []
        
        # Check Amount contribution
        scaled_amount = df_scaled.loc[0, "Amount"]
        if scaled_amount > 1.5:  # more than 1.5 std deviation from mean
            contribution = min(0.4, float(scaled_amount * 0.1))
            factors.append({
                "factor": "Unusually Large Amount",
                "contribution": round(contribution, 2),
                "direction": "positive",
                "detail": f"Transaction value of ₹{amount:,.2f} is significantly above normal thresholds."
            })
            
        # Extract PCA contributions (look at top 3 high-importance PCA variables with large values)
        pca_indices = [i for i, f in enumerate(self.fraud_features) if f.startswith("V")]
        sorted_pca_importances = sorted(
            [(importances[i], self.fraud_features[i], df_scaled.iloc[0, i]) for i in pca_indices],
            key=lambda x: abs(x[0] * x[2]),
            reverse=True
        )
        
        # Add the top PCA components as contributing factors
        for imp, name, val in sorted_pca_importances[:3]:
            contrib = float(imp * val)
            if abs(contrib) > 0.01:
                direction = "positive" if contrib > 0 else "negative"
                factors.append({
                    "factor": f"Anomalous PCA Vector {name}",
                    "contribution": round(abs(contrib), 2),
                    "direction": direction,
                    "detail": f"Model detected a pattern variance in security signature {name}."
                })
                
        # If no factors were triggered but risk score is non-zero, append a base factor
        if not factors:
            factors.append({
                "factor": "Transaction Profile Match",
                "contribution": round(prob, 2),
                "direction": "positive",
                "detail": "General feature correlation matches historic risk profiles."
            })
            
        return score, level, factors, recommendations[level]

    def predict_intrusion(self, raw_features: Dict[str, Any]) -> Tuple[int, str, List[Dict[str, Any]], str]:
        """
        Runs ML prediction for network intrusion.
        """
        if self.intrusion_model is None:
            raise RuntimeError("Intrusion model not loaded.")

        # Reconstruct standard feature vector
        # Categorical features
        proto = str(raw_features.get("protocol_type", "tcp")).lower()
        flag = str(raw_features.get("flag", "SF")).upper()
        service = str(raw_features.get("service", "http")).lower()
        
        proto_enc = self.protocol_map.get(proto, 0)
        flag_enc = self.flag_map.get(flag, 0)
        service_enc = self.service_map.get(service, 1)  # default to 'other' index if not found
        
        # Map inputs
        features_dict = {
            "protocol_encoded": proto_enc,
            "flag_encoded": flag_enc,
            "service_encoded": service_enc
        }
        
        # Fill numerical features
        for feat in self.intrusion_numeric_features:
            features_dict[feat] = float(raw_features.get(feat, 0.0))
            
        # Create DataFrame
        df_feats = pd.DataFrame([features_dict])[self.intrusion_features]
        df_scaled = df_feats.copy()
        df_scaled[self.intrusion_numeric_features] = self.intrusion_scaler.transform(df_feats[self.intrusion_numeric_features])
        
        # Predict probability
        prob = self.intrusion_model.predict_proba(df_scaled)[0][1]
        score = int(prob * 100)
        
        # Determine level
        if score <= 30:
            level = "low"
        elif score <= 60:
            level = "medium"
        elif score <= 80:
            level = "high"
        else:
            level = "critical"
            
        # Recommendations
        recommendations = {
            "low": "Normal network transaction bounds. No threats detected.",
            "medium": "Investigate connection spike. Review security group settings.",
            "high": "Isolate connection source. Route traffic to sandbox.",
            "critical": "Block source IP address immediately. Notify network team and trigger incident response."
        }
        
        # Calculate feature contributions for explainability (SHAP approximation)
        importances = self.intrusion_model.feature_importances_
        factors = []
        
        # If flag is abnormal (anything other than SF / normal connection establish)
        if flag != "SF":
            factors.append({
                "factor": "Abnormal Connection Handshake",
                "contribution": 0.35,
                "direction": "positive",
                "detail": f"Network session terminated with unexpected TCP flag '{flag}'."
            })
            
        # Check source bytes exfiltration
        src_bytes = float(df_feats.loc[0, "src_bytes"])
        if src_bytes > 50000:
            factors.append({
                "factor": "High Data Outflow",
                "contribution": 0.25,
                "direction": "positive",
                "detail": f"Session transmitted an unusually high data payload ({src_bytes:,.0f} bytes)."
            })
            
        # Check destination bytes download
        dst_bytes = float(df_feats.loc[0, "dst_bytes"])
        if dst_bytes > 100000:
            factors.append({
                "factor": "High Data Inflow",
                "contribution": 0.20,
                "direction": "positive",
                "detail": f"Session downloaded a large amount of payload data ({dst_bytes:,.0f} bytes)."
            })
            
        # Check rate and count
        count = float(df_feats.loc[0, "count"])
        if count > 50:
            factors.append({
                "factor": "Connection Velocity Spike",
                "contribution": 0.30,
                "direction": "positive",
                "detail": f"Detected {count:.0f} connections to same host within 2 seconds (port scan signature)."
            })
            
        # Fallback if factors list is empty
        if not factors:
            factors.append({
                "factor": "Traffic Profile Correlation",
                "contribution": round(prob, 2),
                "direction": "positive",
                "detail": f"Network connection behavior matches database signature profile (probability: {score}%)."
            })
            
        return score, level, factors, recommendations[level]

# Single global instance of ML service
ml_service = MLService()
