import os
import pickle
import random
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# Ensure the output directory exists
os.makedirs("ml/saved_models", exist_ok=True)

print("Starting SENTINEL Machine Learning Training Pipeline...")

# ==============================================================================
# 1. TRAIN FRAUD DETECTION MODEL
# ==============================================================================
print("\n--- 1. Fraud Detection Model ---")
fraud_data_path = "datasets/archive (1)/creditcard.csv"

if os.path.exists(fraud_data_path):
    print(f"Loading fraud dataset from {fraud_data_path}...")
    df_fraud = pd.read_csv(fraud_data_path)
    
    # Remove duplicates
    initial_rows = len(df_fraud)
    df_fraud = df_fraud.drop_duplicates()
    print(f"Removed {initial_rows - len(df_fraud)} duplicates. Remaining: {len(df_fraud)} rows.")
    
    # Downsample class 0 to 10,000, keep all class 1
    fraud_cases = df_fraud[df_fraud["Class"] == 1]
    legit_cases = df_fraud[df_fraud["Class"] == 0].sample(n=10000, random_state=42)
    df_fraud_balanced = pd.concat([fraud_cases, legit_cases]).sample(frac=1, random_state=42)
    print(f"Balanced Dataset Shape: {df_fraud_balanced.shape} (Fraud: {len(fraud_cases)}, Legit: {len(legit_cases)})")
    
    # Define features and target
    feature_cols = ["Amount"] + [f"V{i}" for i in range(1, 29)]
    X = df_fraud_balanced[feature_cols]
    y = df_fraud_balanced["Class"]
    
    # Stratified Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # Scale 'Amount'
    scaler = StandardScaler()
    # We fit the scaler on the train set's Amount and transform it
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    
    X_train_scaled["Amount"] = scaler.fit_transform(X_train[["Amount"]])
    X_test_scaled["Amount"] = scaler.transform(X_test[["Amount"]])
    
    # Train RandomForest
    print("Training RandomForestClassifier for Fraud Detection...")
    clf_fraud = RandomForestClassifier(
        n_estimators=100, max_depth=12, min_samples_split=5, 
        class_weight="balanced", random_state=42, n_jobs=-1
    )
    clf_fraud.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = clf_fraud.predict(X_test_scaled)
    print("\n[Evaluation Results - Fraud Detection]")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save Model Artifacts
    fraud_artifact = {
        "model": clf_fraud,
        "scaler": scaler,
        "features": feature_cols,
        "training_stats": {
            "size": len(df_fraud_balanced),
            "features_count": len(feature_cols),
            "accuracy": accuracy_score(y_test, y_pred)
        }
    }
    
    artifact_path = "ml/saved_models/fraud_model.pkl"
    with open(artifact_path, "wb") as f:
        pickle.dump(fraud_artifact, f)
    print(f"Saved Fraud Model Artifact to {artifact_path}")
else:
    print(f"ERROR: Fraud dataset not found at {fraud_data_path}")

# ==============================================================================
# 2. TRAIN INTRUSION DETECTION MODEL
# ==============================================================================
print("\n--- 2. Network Intrusion Detection Model ---")
intrusion_data_path = "datasets/archive (3)/KDDTrain+_20Percent.txt"

if os.path.exists(intrusion_data_path):
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
    
    print(f"Loading intrusion dataset from {intrusion_data_path}...")
    df_kdd = pd.read_csv(intrusion_data_path, names=kdd_cols, header=None)
    
    # Binary Label Mapping: normal = 0, anything else = 1
    df_kdd["target"] = df_kdd["label"].apply(lambda x: 0 if x == "normal" else 1)
    
    # Build maps for categorical features
    protocols = sorted(df_kdd["protocol_type"].unique().tolist())
    protocol_map = {proto: idx for idx, proto in enumerate(protocols)}
    
    flags = sorted(df_kdd["flag"].unique().tolist())
    flag_map = {flag: idx for idx, flag in enumerate(flags)}
    
    services = sorted(df_kdd["service"].unique().tolist())
    service_map = {svc: idx for idx, svc in enumerate(services)}
    
    # Encode categoricals in the df
    df_kdd["protocol_encoded"] = df_kdd["protocol_type"].map(protocol_map)
    df_kdd["flag_encoded"] = df_kdd["flag"].map(flag_map)
    df_kdd["service_encoded"] = df_kdd["service"].map(service_map)
    
    # Features List
    numeric_features = [
        'duration', 'src_bytes', 'dst_bytes', 'wrong_fragment', 'urgent', 'hot', 
        'num_failed_logins', 'logged_in', 'num_compromised', 'root_shell', 
        'su_attempted', 'num_root', 'num_file_creations', 'num_shells', 
        'num_access_files', 'count', 'srv_count', 'serror_rate', 'rerror_rate', 
        'same_srv_rate', 'diff_srv_rate', 'srv_diff_host_rate'
    ]
    categorical_features = ['protocol_encoded', 'flag_encoded', 'service_encoded']
    all_features = categorical_features + numeric_features
    
    X = df_kdd[all_features]
    y = df_kdd["target"]
    
    # Stratified Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # Standardize numeric features (keeping categoricals as-is)
    scaler = StandardScaler()
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    
    X_train_scaled[numeric_features] = scaler.fit_transform(X_train[numeric_features])
    X_test_scaled[numeric_features] = scaler.transform(X_test[numeric_features])
    
    # Train RandomForest
    print("Training RandomForestClassifier for Intrusion Detection...")
    clf_intrusion = RandomForestClassifier(
        n_estimators=100, max_depth=15, min_samples_split=4,
        class_weight="balanced", random_state=42, n_jobs=-1
    )
    clf_intrusion.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = clf_intrusion.predict(X_test_scaled)
    print("\n[Evaluation Results - Intrusion Detection]")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save Model Artifacts
    intrusion_artifact = {
        "model": clf_intrusion,
        "scaler": scaler,
        "features": all_features,
        "numeric_features": numeric_features,
        "protocol_map": protocol_map,
        "flag_map": flag_map,
        "service_map": service_map,
        "training_stats": {
            "size": len(df_kdd),
            "features_count": len(all_features),
            "accuracy": accuracy_score(y_test, y_pred)
        }
    }
    
    artifact_path = "ml/saved_models/intrusion_model.pkl"
    with open(artifact_path, "wb") as f:
        pickle.dump(intrusion_artifact, f)
    print(f"Saved Intrusion Model Artifact to {artifact_path}")
else:
    print(f"ERROR: Intrusion dataset not found at {intrusion_data_path}")

print("\nModel training pipeline finished successfully!")
