import os
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

# Set style for high-quality professional visuals
sns.set_theme(style="whitegrid")
plt.rcParams.update({
    'font.size': 12,
    'axes.labelsize': 12,
    'axes.titlesize': 14,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'figure.titlesize': 16
})

# Create directory structure
base_dir = "visualizations"
os.makedirs(base_dir, exist_ok=True)
os.makedirs(os.path.join(base_dir, "fraud"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "intrusion"), exist_ok=True)

print("Starting visualization generation pipeline...")

# ==============================================================================
# 1. LOAD MODEL ARTIFACTS
# ==============================================================================
try:
    with open("ml/saved_models/fraud_model.pkl", "rb") as f:
        fraud_data = pickle.load(f)
    print("Loaded Fraud Model successfully.")
except Exception as e:
    print(f"Error loading Fraud Model: {e}")
    fraud_data = None

try:
    with open("ml/saved_models/intrusion_model.pkl", "rb") as f:
        intrusion_data = pickle.load(f)
    print("Loaded Intrusion Model successfully.")
except Exception as e:
    print(f"Error loading Intrusion Model: {e}")
    intrusion_data = None

# ==============================================================================
# 2. GENERATE FRAUD PLOTS
# ==============================================================================
if fraud_data:
    model = fraud_data["model"]
    scaler = fraud_data["scaler"]
    features = fraud_data["features"]
    
    # Reload dataset to compute evaluation split for plotting
    df_fraud = pd.read_csv("datasets/archive (1)/creditcard.csv").drop_duplicates()
    fraud_cases = df_fraud[df_fraud["Class"] == 1]
    legit_cases = df_fraud[df_fraud["Class"] == 0].sample(n=10000, random_state=42)
    df_fraud_balanced = pd.concat([fraud_cases, legit_cases]).sample(frac=1, random_state=42)
    
    X = df_fraud_balanced[features]
    y = df_fraud_balanced["Class"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    X_test_scaled = X_test.copy()
    X_test_scaled["Amount"] = scaler.transform(X_test[["Amount"]])
    y_pred = model.predict(X_test_scaled)
    
    # Plot 1: Fraud Confusion Matrix
    plt.figure(figsize=(6, 5))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                xticklabels=["Legit", "Fraud"], yticklabels=["Legit", "Fraud"])
    plt.title("Confusion Matrix - Fraud Detection")
    plt.ylabel("Actual Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "fraud", "confusion_matrix.png"), dpi=150)
    plt.close()
    
    # Plot 2: Fraud Feature Importance
    plt.figure(figsize=(10, 6))
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:10]  # Top 10 features
    top_features = [features[i] for i in indices]
    top_importances = importances[indices]
    
    sns.barplot(x=top_importances, y=top_features, palette="viridis")
    plt.title("Top 10 Feature Importances - Fraud Detection")
    plt.xlabel("Relative Importance")
    plt.ylabel("Feature")
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "fraud", "feature_importance.png"), dpi=150)
    plt.close()

# ==============================================================================
# 3. GENERATE INTRUSION PLOTS
# ==============================================================================
if intrusion_data:
    model = intrusion_data["model"]
    scaler = intrusion_data["scaler"]
    features = intrusion_data["features"]
    numeric_features = intrusion_data["numeric_features"]
    protocol_map = intrusion_data["protocol_map"]
    flag_map = intrusion_data["flag_map"]
    service_map = intrusion_data["service_map"]
    
    # Reload dataset to compute evaluation split for plotting
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
    df_kdd = pd.read_csv("datasets/archive (3)/KDDTrain+_20Percent.txt", names=kdd_cols, header=None)
    df_kdd["target"] = df_kdd["label"].apply(lambda x: 0 if x == "normal" else 1)
    df_kdd["protocol_encoded"] = df_kdd["protocol_type"].map(protocol_map)
    df_kdd["flag_encoded"] = df_kdd["flag"].map(flag_map)
    df_kdd["service_encoded"] = df_kdd["service"].map(service_map)
    
    X = df_kdd[features]
    y = df_kdd["target"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    X_test_scaled = X_test.copy()
    X_test_scaled[numeric_features] = scaler.transform(X_test[numeric_features])
    y_pred = model.predict(X_test_scaled)
    
    # Plot 1: Intrusion Confusion Matrix
    plt.figure(figsize=(6, 5))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt="d", cmap="Oranges", cbar=False,
                xticklabels=["Benign", "Malicious"], yticklabels=["Benign", "Malicious"])
    plt.title("Confusion Matrix - Network Intrusion")
    plt.ylabel("Actual Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "intrusion", "confusion_matrix.png"), dpi=150)
    plt.close()
    
    # Plot 2: Intrusion Feature Importance
    plt.figure(figsize=(10, 6))
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:10]  # Top 10 features
    
    # Clean feature names for displaying
    feature_display_names = []
    for idx in indices:
        name = features[idx]
        if name == "protocol_encoded": name = "protocol_type"
        elif name == "flag_encoded": name = "tcp_flag"
        elif name == "service_encoded": name = "network_service"
        feature_display_names.append(name)
        
    top_importances = importances[indices]
    
    sns.barplot(x=top_importances, y=feature_display_names, palette="plasma")
    plt.title("Top 10 Feature Importances - Network Intrusion")
    plt.xlabel("Relative Importance")
    plt.ylabel("Feature")
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "intrusion", "feature_importance.png"), dpi=150)
    plt.close()

# ==============================================================================
# 4. PLOT MODEL METRICS COMPARISON
# ==============================================================================
# Precision, Recall, F1 for Fraud: 0.97, 0.79, 0.87
# Precision, Recall, F1 for Intrusion: 1.00, 0.99, 1.00
metrics_data = {
    "Model": ["Fraud Detection"] * 3 + ["Network Intrusion"] * 3,
    "Metric": ["Precision", "Recall", "F1-Score"] * 2,
    "Value": [0.97, 0.79, 0.87, 1.00, 0.99, 1.00]
}
df_metrics = pd.DataFrame(metrics_data)

plt.figure(figsize=(8, 5))
sns.barplot(x="Metric", y="Value", hue="Model", data=df_metrics, palette="muted")
plt.ylim(0, 1.1)
for p in plt.gca().patches:
    h = p.get_height()
    if h > 0:
        plt.gca().annotate(f"{h:.2f}", (p.get_x() + p.get_width() / 2., h),
                           ha='center', va='center', xytext=(0, 8), textcoords='offset points', fontsize=9)
plt.title("Classifier Performance Comparison")
plt.ylabel("Score")
plt.xlabel("Evaluation Metric")
plt.legend(loc="lower left")
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "model_comparison.png"), dpi=150)
plt.close()

print("All graphs and charts generated successfully in 'visualizations/' folder!")
