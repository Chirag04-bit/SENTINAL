# ─── SENTINEL AI Security Copilot Router ──────────────────────────────────────
# Exposes chat and evaluation assistant capabilities to the client.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.config.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    threat_level: str
    reasons: List[str]
    actions: List[str]

@router.post("/chat", response_model=ChatResponse, summary="Chat with AI Security Copilot")
def chat_with_copilot(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = payload.message.lower()
    
    # Audit log entry for copilot access transparency
    audit = AuditLog(
        user_id=current_user.id,
        action="Consult AI Copilot",
        source="AI Assistant Chat",
        purpose=f"Consultation about: '{payload.message[:50]}...'"
    )
    db.add(audit)
    db.commit()

    # Rule-based conversational model
    if any(k in msg for k in ["phish", "email", "link", "website", "url", "spam"]):
        return ChatResponse(
            reply="Phishing and deceptive URLs are the most common entry points for hackers. Always check the sender address carefully and verify that the domain name is correct before entering any details.",
            threat_level="medium",
            reasons=[
                "Sender address may simulate legitimate brands (e.g. support@netflix-billing.com)",
                "Requests for immediate credential verification or payments",
                "Link directs to an external, unverified hostname"
            ],
            actions=[
                "Do NOT click links in suspicious emails.",
                "Verify the request through an independent channel (official phone number or app).",
                "Flag and delete the email to clean your mailbox."
            ]
        )
    elif any(k in msg for k in ["pass", "password", "leak", "hack", "credential"]):
        return ChatResponse(
            reply="Weak, reused, or compromised passwords account for over 80% of data breaches. Using a unique, complex password for every account is the foundation of digital safety.",
            threat_level="low",
            reasons=[
                "Duplicate passwords allow attackers to breach multiple services (credential stuffing)",
                "Simple patterns are easily brute-forced by dictionary scripts",
                "Lack of multi-factor authentication creates a single point of failure"
            ],
            actions=[
                "Enable Multi-Factor Authentication (MFA/2FA) on all critical accounts.",
                "Use a password manager to generate and store 16+ character random passwords.",
                "Regularly scan for leaked credentials using tools like HaveIBeenPwned."
            ]
        )
    elif any(k in msg for k in ["malware", "virus", "download", "install", "exe", "app"]):
        return ChatResponse(
            reply="Unsafe files and malware can execute code in the background to log keystrokes or steal session tokens. Never run downloaded files unless their publisher signature is valid.",
            threat_level="high",
            reasons=[
                "File possesses an executable suffix (.exe, .msi, .bat, .scr)",
                "No valid digital signature from a verified publisher",
                "Download source has a low web reputation score"
            ],
            actions=[
                "Ensure your system firewall and antivirus settings are enabled.",
                "Scan the file locally using Windows Defender or commercial protection packages.",
                "Upload suspicious hashes to VirusTotal to verify safety indicators."
            ]
        )
    else:
        return ChatResponse(
            reply=f"Hello {current_user.name}! I am your SENTINEL AI Security Assistant. I can help evaluate risks, explain threats in simple language, and walk you through security configurations.",
            threat_level="none",
            reasons=[
                "General inquiry requested by monitored client"
            ],
            actions=[
                "Connect data sources in the Connection Center to activate active scanning.",
                "Review the alerts and security score panel on your dashboard.",
                "Ask me about phishing, passwords, or safe downloads for specific advice!"
            ]
        )
