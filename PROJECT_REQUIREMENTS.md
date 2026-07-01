# SENTINEL – Project Requirements

> **S**mart **E**mergency **N**etwork for **T**hreat **I**ntelligence & **N**etwork **E**valuation **L**ayer

---

## 1. Project Overview

SENTINEL is an AI-powered Real-Time Anomaly Detection Dashboard capable of detecting suspicious activities, fraud, and cybersecurity threats. It provides explainable AI alerts, risk score generation, live analytics, and report generation for both technical and non-technical users.

---

## 2. Project Information

| Field | Detail |
|-------|--------|
| **Project Name** | SENTINEL |
| **Full Form** | Smart Emergency Network for Threat Intelligence & Live-monitoring |
| **Domain** | Artificial Intelligence & Machine Learning |
| **Sub-Domain** | Anomaly Detection & Cybersecurity Monitoring |
| **Duration** | 6 Weeks |
| **Type** | Research-Oriented AI Project |

---

## 3. Goals

| # | Goal | Priority |
|---|------|----------|
| G1 | Detect fraudulent financial transactions in real time | HIGH |
| G2 | Detect network intrusion/anomalies across packet-level data | HIGH |
| G3 | Provide Explainable AI (XAI) outputs (SHAP / LIME) | HIGH |
| G4 | Expose REST API for integration with external systems | HIGH |
| G5 | Generate Risk Scores (0–100) per event | HIGH |
| G6 | Provide User & Admin Dashboards | HIGH |
| G7 | Support Online & Offline Monitoring | MEDIUM |
| G8 | Generate PDF/CSV Reports | MEDIUM |

---

## 4. Core Modules

| # | Module | Priority |
|---|--------|----------|
| 1 | Real-Time Anomaly Detection Engine | HIGH |
| 2 | Financial Fraud Detection | HIGH |
| 3 | Network Intrusion Detection | HIGH |
| 4 | Explainable AI Alerts (SHAP/LIME) | HIGH |
| 5 | Risk Score Engine | HIGH |
| 6 | Live Analytics Dashboard | HIGH |
| 7 | User Dashboard | HIGH |
| 8 | Admin Dashboard | HIGH |
| 9 | Online / Offline Monitoring | MEDIUM |
| 10 | Report Generation | MEDIUM |

---

## 5. User Roles

| Role | Access Level |
|------|-------------|
| **General User** | View own alerts, risk scores, activity |
| **Analyst** | View all events, filter, export reports |
| **Admin** | Full control: users, models, system config |

---

## 6. Functional Requirements

### Detection & Intelligence
- FR-01: Detect anomalies in real-time financial transaction data
- FR-02: Detect network intrusions from packet/flow data
- FR-03: Generate a 0–100 Risk Score per event
- FR-04: Provide SHAP/LIME explanations for every alert
- FR-05: Support both online (streaming) and offline (batch) modes

### Dashboard & Visualization
- FR-06: Live dashboard with real-time chart updates
- FR-07: Threat map / geographic visualization
- FR-08: Alert feed with severity classification (Low / Medium / High / Critical)
- FR-09: Historical trend graphs
- FR-10: Per-user activity timeline

### Alerts & Notifications
- FR-11: In-app alert notifications
- FR-12: Each alert must explain: Why it happened, What caused it, Recommended action
- FR-13: Alert severity color coding

### Reports
- FR-14: Export PDF/CSV reports
- FR-15: Scheduled report generation (daily/weekly)

### Admin
- FR-16: User management panel
- FR-17: Model health monitoring
- FR-18: System configuration panel

---

## 7. Non-Functional Requirements

| NFR | Requirement |
|-----|-------------|
| NFR-01 | UI understandable within 30 seconds by a non-technical user |
| NFR-02 | Alert response time < 2 seconds |
| NFR-03 | Dashboard must be responsive (mobile + desktop) |
| NFR-04 | Modular, dataset-independent ML pipeline |
| NFR-05 | Clean, documented codebase suitable for research presentation |
| NFR-06 | Demo-ready at any phase with mock data |

---

## 8. Target Users

- General Public
- Students
- Small Businesses
- Banks
- Cybersecurity Teams
- Organizations
- Government Agencies

---

## 9. Development Phases

| Phase | Name |
|-------|------|
| Phase 1 | Requirement Analysis |
| Phase 2 | System Architecture |
| Phase 3 | UI/UX Design |
| Phase 4 | Frontend Development |
| Phase 5 | Backend Development |
| Phase 6 | Database Design |
| Phase 7 | Machine Learning Pipeline |
| Phase 8 | Risk Score Engine |
| Phase 9 | Explainable Alert System |
| Phase 10 | Online & Offline Monitoring |
| Phase 11 | Testing |
| Phase 12 | Deployment |
| Phase 13 | Documentation |

---

*Last Updated: June 2026*
