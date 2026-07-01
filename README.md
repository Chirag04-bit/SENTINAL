# 🛡️ SENTINEL

<div align="center">

# 🛡️ SENTINEL
### Smart Emergency Network for Threat Intelligence & Network Evaluation Layer

### AI-Powered Real-Time Cybersecurity, Fraud Detection & Threat Intelligence Platform

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Build-purple?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38BDF8?style=for-the-badge&logo=tailwind-css)
![Machine Learning](https://img.shields.io/badge/Machine-Learning-success?style=for-the-badge)
![Cyber Security](https://img.shields.io/badge/Cyber-Security-red?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

An intelligent AI-powered cybersecurity platform that combines **Financial Fraud Detection**, **Network Intrusion Detection**, **Real-Time Threat Monitoring**, **Risk Scoring**, and **Interactive Analytics** into a unified dashboard.

</div>

---

# 🚀 Overview

SENTINEL is a full-stack AI-powered cybersecurity platform designed to identify suspicious activities across multiple security domains.

The system integrates modern Machine Learning techniques with a scalable FastAPI backend and a React-based dashboard to provide real-time threat detection, risk analysis, explainable alerts, and security analytics.

Unlike traditional monitoring systems that only generate alerts, SENTINEL provides contextual insights, risk scoring, and visual analytics to help security analysts understand and respond to threats more effectively.

---

# 🎯 Objectives

The primary objectives of SENTINEL are:

- 🔍 Detect anomalous activities in real time
- 💳 Identify fraudulent financial transactions
- 🌐 Detect malicious network intrusions
- 📊 Generate intelligent risk scores
- 🧠 Provide Explainable AI insights
- 📈 Visualize live security events
- 📄 Generate downloadable reports
- 🔐 Secure administrator and user access
- ⚡ Deliver a responsive real-time dashboard

---

# ✨ Key Features

## 🛡️ Threat Detection

- Real-time anomaly detection
- AI-powered fraud detection
- Network intrusion detection
- Risk score generation
- Threat categorization
- Live event monitoring

---

## 📊 Interactive Dashboard

- Admin Dashboard
- User Dashboard
- Analytics Page
- Reports Page
- Alerts Page
- System Settings
- Real-Time Statistics
- Risk Visualization

---

## 🔐 Authentication

- Secure Login
- User Authentication
- Role-Based Access Control
- Protected Routes
- Session Management

---

## 📈 Analytics

- Risk Gauge
- Threat Distribution
- Security Metrics
- Live Alert Feed
- Performance Statistics
- Report Generation

---

## ⚙️ Backend Services

- REST APIs
- Alert Management
- Authentication APIs
- Risk Engine
- Event Processing
- Report Services

---
# 🏗️ System Architecture

```
                          ┌───────────────────────────┐
                          │        Web Browser        │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────┐
                    │       React + TypeScript        │
                    │      Vite + Tailwind CSS        │
                    └─────────────┬───────────────────┘
                                  │ REST API
                                  ▼
                    ┌─────────────────────────────────┐
                    │          FastAPI Backend        │
                    ├─────────────────────────────────┤
                    │ Authentication                  │
                    │ Alert Management                │
                    │ Risk Score Engine               │
                    │ Event Processing                │
                    │ Report Generation               │
                    └─────────────┬───────────────────┘
                                  │
          ┌───────────────────────┼────────────────────────┐
          ▼                       ▼                        ▼
 ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
 │ Fraud Detection│      │ Intrusion IDS  │      │ Risk Engine    │
 │ Machine Learning│     │ ML Pipeline    │      │ AI Analytics   │
 └────────────────┘      └────────────────┘      └────────────────┘
                                  │
                                  ▼
                         Security Intelligence
```

---

# 📂 Project Structure

```
SENTINEL/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routers/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── datasets/
│
├── PROJECT_REQUIREMENTS.md
├── README.md
└── .env.example
```

---

# ⚙️ Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | FastAPI, Python |
| API | REST API |
| Authentication | JWT Authentication |
| Machine Learning | Scikit-learn |
| Data Processing | Pandas, NumPy |
| Database | SQLite / PostgreSQL |
| Validation | Pydantic |
| Charts | Custom Dashboard Widgets |
| Version Control | Git & GitHub |

---

# 🧠 Core Modules

## 🔍 Threat Detection Engine

The Threat Detection Engine continuously analyzes incoming events to identify suspicious activities using AI-driven anomaly detection techniques.

### Features

- Real-time anomaly detection
- Threat classification
- Event prioritization
- Confidence scoring
- Alert generation

---

## 💳 Financial Fraud Detection

Detects fraudulent financial transactions using machine learning models trained on transaction patterns.

### Capabilities

- Credit card fraud detection
- Transaction risk scoring
- Behavioral analysis
- Fraud probability estimation
- High-risk transaction alerts

---

## 🌐 Network Intrusion Detection

Monitors network traffic to detect malicious behavior and unauthorized access attempts.

### Detection Types

- DoS / DDoS attacks
- Port scanning
- Brute-force attacks
- Malware communication
- Suspicious traffic patterns
- Network anomalies

---

## 📊 Risk Score Engine

Every detected event receives an intelligent risk score between **0–100** based on multiple parameters.

### Risk Levels

| Score | Severity |
|--------|----------|
| 0–20 | Low |
| 21–40 | Moderate |
| 41–60 | Medium |
| 61–80 | High |
| 81–100 | Critical |

---

## 📈 Analytics Dashboard

The dashboard provides real-time visibility into system health and detected threats.

### Dashboard Includes

- Live alerts
- Threat statistics
- Security overview
- Risk visualization
- Historical trends
- Reports
- User activity
- Performance metrics

---
# 🚀 Features

## ✅ Authentication & Security

- JWT-based Authentication
- Secure Login System
- Role-Based Access Control (RBAC)
- Protected Routes
- Session Management
- User Access Validation

---

## 🚨 Alert Management

- Live Alert Monitoring
- Threat Categorization
- Risk-Based Prioritization
- Alert Status Tracking
- Alert History
- Event Logging

---

## 📊 Dashboard & Analytics

- Interactive Dashboard
- Real-Time Metrics
- Threat Statistics
- Risk Distribution
- Recent Alerts
- Activity Monitoring
- Security Overview
- Performance Charts

---

## 📄 Reports

- Security Reports
- Alert Reports
- Threat Summary
- CSV Export
- PDF Report Generation
- Historical Analysis

---

## ⚡ Backend Services

- RESTful API
- FastAPI Framework
- Authentication Services
- Alert Services
- Risk Engine
- Event Processing
- Report Services

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/Chirag04-bit/SENTINAL.git

cd SENTINAL
```

---

# ⚙️ Backend Setup

Navigate to the backend directory.

```bash
cd backend
```

Create a virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the backend server.

```bash
uvicorn app.main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

# 💻 Frontend Setup

Navigate to frontend.

```bash
cd frontend
```

Install packages.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 🌍 Environment Variables

Create a `.env` file inside the backend directory.

```env
DATABASE_URL=sqlite:///./sentinel.db

SECRET_KEY=your-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

DEBUG=True
```

Example:

```
backend/
    .env
```

---

# 📋 API Documentation

After running the backend, visit:

Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

# 🔌 API Modules

Current API services include:

- Authentication
- User Management
- Alert Management
- Risk Analysis
- Reports
- Dashboard Analytics

---

# 📡 Example API Endpoints

## Authentication

```
POST /login
POST /register
POST /refresh-token
```

---

## Alerts

```
GET /alerts
GET /alerts/{id}
POST /alerts
PUT /alerts/{id}
DELETE /alerts/{id}
```

---

## Reports

```
GET /reports
POST /reports
GET /reports/download
```

---

## Analytics

```
GET /analytics
GET /statistics
GET /risk-score
```

---

# 🛠️ Development Workflow

```
Clone Repository
        │
        ▼
Install Dependencies
        │
        ▼
Configure Environment
        │
        ▼
Run Backend
        │
        ▼
Run Frontend
        │
        ▼
Access Dashboard
        │
        ▼
Start Development
```

---

# 🔄 Project Workflow

```
Incoming Event
        │
        ▼
Threat Detection
        │
        ▼
Risk Analysis
        │
        ▼
Alert Generation
        │
        ▼
Dashboard Update
        │
        ▼
Report Generation
```

---
# 🤖 Machine Learning Pipeline

SENTINEL leverages Artificial Intelligence and Machine Learning to identify suspicious activities across multiple cybersecurity domains.

The platform is designed to support both supervised and unsupervised learning techniques for anomaly detection and fraud analysis.

---

## AI Pipeline

```
Raw Data
     │
     ▼
Data Cleaning
     │
     ▼
Feature Engineering
     │
     ▼
Model Training
     │
     ▼
Model Evaluation
     │
     ▼
Risk Scoring
     │
     ▼
Threat Classification
     │
     ▼
Dashboard Visualization
```

---

## Machine Learning Capabilities

- Fraud Detection
- Network Intrusion Detection
- Anomaly Detection
- Risk Prediction
- Threat Classification
- Pattern Recognition
- Security Analytics

---

## Future AI Enhancements

- Explainable AI (SHAP)
- Explainable AI (LIME)
- Deep Learning Models
- AutoML Pipeline
- Online Learning
- Real-Time Model Retraining

---

# 📂 Datasets

The project has been designed to work with multiple public cybersecurity datasets.

| Dataset | Purpose |
|----------|----------|
| Credit Card Fraud Detection | Financial Fraud Detection |
| PaySim Financial Dataset | Transaction Fraud Analysis |
| NSL-KDD | Network Intrusion Detection |
| UNSW-NB15 | Modern Network Attack Detection |

> **Note:** Large datasets are intentionally excluded from the GitHub repository. Download them separately and place them inside the `datasets/` directory.

Example:

```
datasets/
├── creditcard.csv
├── PS_20174392719_1491204439457_log.csv
├── KDDTrain+.txt
├── KDDTest+.txt
├── UNSW_NB15_training-set.csv
└── UNSW_NB15_testing-set.csv
```

---

# 📸 Application Screenshots

> Add screenshots after completing the UI.

## Login Page

```
docs/screenshots/login.png
```

---

## Admin Dashboard

```
docs/screenshots/dashboard.png
```

---

## Analytics

```
docs/screenshots/analytics.png
```

---

## Alerts

```
docs/screenshots/alerts.png
```

---

## Reports

```
docs/screenshots/reports.png
```

---

# 📊 Current Progress

| Module | Status |
|----------|---------|
| Frontend UI | ✅ Completed |
| Backend APIs | ✅ Completed |
| Authentication | ✅ Completed |
| Dashboard | ✅ Completed |
| Alert System | ✅ Completed |
| Analytics | ✅ Completed |
| Reports | ✅ Completed |
| Risk Engine | 🚧 In Progress |
| Machine Learning Integration | 🚧 In Progress |
| Database Integration | 🚧 In Progress |
| Explainable AI | 📅 Planned |
| Deployment | 📅 Planned |

---

# 🛣️ Roadmap

## Version 1.0

- [x] React Frontend
- [x] FastAPI Backend
- [x] Authentication
- [x] Dashboard
- [x] Alerts
- [x] Reports
- [x] Analytics
- [x] Risk Visualization

---

## Version 1.5

- [ ] PostgreSQL Integration
- [ ] Redis Cache
- [ ] Docker Support
- [ ] Logging System
- [ ] Unit Testing
- [ ] API Rate Limiting

---

## Version 2.0

- [ ] Real-Time WebSockets
- [ ] Email Notifications
- [ ] SMS Alerts
- [ ] AI Explainability
- [ ] Multi-Factor Authentication
- [ ] Cloud Deployment

---

## Version 3.0

- [ ] Kubernetes Deployment
- [ ] Multi-Tenant Support
- [ ] SOC Dashboard
- [ ] Threat Intelligence Feed
- [ ] SIEM Integration
- [ ] Mobile Application

---

# 🤝 Contributing

Contributions are welcome!

If you would like to improve SENTINEL:

1. Fork the repository
2. Create a new feature branch

```
git checkout -b feature/your-feature
```

3. Commit your changes

```
git commit -m "Add new feature"
```

4. Push your branch

```
git push origin feature/your-feature
```

5. Open a Pull Request

---

# 🧪 Testing

Backend

```
pytest
```

Frontend

```
npm test
```

---

# 📜 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and distribute this project for educational and research purposes.

---

# 👨‍💻 Author

## Chirag Sharma

**B.Tech – Computer Science & Engineering (AI)**  
Institute of Engineering & Management (IEM), Kolkata

### Connect with me

- GitHub: https://github.com/Chirag04-bit
- LinkedIn: https://www.linkedin.com/in/chirag-sharma-5a79b4322/

---

# 🙏 Acknowledgements

Special thanks to the open-source community and the creators of:

- FastAPI
- React
- TypeScript
- Vite
- Tailwind CSS
- Scikit-learn
- NumPy
- Pandas
- PostgreSQL
- Python

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps the project reach more developers and motivates future improvements.

---

<div align="center">

## 🛡️ SENTINEL

### AI-Powered Cybersecurity Intelligence Platform

**Built with ❤️ by Chirag Sharma**

⭐ **Don't forget to Star this repository!** ⭐

</div>
---

# 🎬 Demo

> Coming Soon

The application demo will showcase:

- User Authentication
- Admin Dashboard
- Threat Monitoring
- Fraud Detection
- Risk Score Engine
- Analytics Dashboard
- Report Generation

---

# 📸 Screenshots

| Login | Dashboard |
|--------|-----------|
| ![](docs/screenshots/login.png) | ![](docs/screenshots/dashboard.png) |

| Alerts | Analytics |
|---------|-----------|
| ![](docs/screenshots/alerts.png) | ![](docs/screenshots/analytics.png) |

| Reports |
|----------|
| ![](docs/screenshots/reports.png) |

---

# 📊 Performance Goals

| Metric | Target |
|----------|---------|
| API Response Time | < 200 ms |
| Dashboard Load Time | < 2 sec |
| Authentication | < 500 ms |
| Risk Score Generation | < 1 sec |
| Fraud Detection Accuracy | > 95% |
| Intrusion Detection Accuracy | > 95% |

---

# ❓ Frequently Asked Questions

### Is this production ready?

The current version is intended for educational, research, and portfolio purposes. Some production-grade features such as deployment, monitoring, and advanced security are planned for future releases.

---

### Which datasets are supported?

The project supports public cybersecurity datasets including:

- Credit Card Fraud Detection
- PaySim
- NSL-KDD
- UNSW-NB15

---

### Does it use Machine Learning?

Yes. The platform is designed to integrate machine learning models for fraud detection, anomaly detection, and network intrusion detection.

---

### Can I contribute?

Absolutely! Contributions, bug reports, and feature requests are welcome.

---

# 🐞 Known Issues

- Machine Learning models are under active development.
- Database integration is being expanded.
- WebSocket support is planned.
- Cloud deployment is not yet available.

---

# 📈 Future Scope

- AI-powered threat intelligence
- Explainable AI dashboards
- Live WebSocket streaming
- Docker support
- Kubernetes deployment
- Redis caching
- Multi-factor authentication
- SIEM integration
- Email & SMS alerts
- Mobile application
- Cloud-native deployment
- Multi-tenant architecture

---

# 📝 Changelog

## v0.1.0

- Initial project structure
- React frontend
- FastAPI backend
- Authentication module
- Dashboard UI
- Alert management
- Analytics pages
- Report module

---

# 🔒 Security

If you discover a security vulnerability, please create a private issue or contact the maintainer before publicly disclosing it.

---

# 📚 Citation

If you use this project in your research or academic work, please cite it appropriately.

```text
Chirag Sharma.
SENTINEL: Smart Emergency Network for Threat Intelligence &
Network Evaluation Layer.
GitHub Repository.
2026.
```

---

# 🌟 Show Your Support

If you like this project:

⭐ Star the repository

🍴 Fork it

🛠️ Contribute

📢 Share it with others

---

<div align="center">

## ⭐ Thanks for Visiting! ⭐

**SENTINEL** aims to combine Artificial Intelligence, Cybersecurity, and Real-Time Analytics into a unified threat intelligence platform.

Made with ❤️ by **Chirag Sharma**

</div>
