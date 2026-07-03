import json
import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.event import Event
from app.models.alert import Alert
from app.models.report import Report
from app.services.auth_service import hash_password

# ─── Seed Helper Data ─────────────────────────────────────────────────────────
USER_NAMES = [
    'Aryan Sharma', 'Priya Patel', 'Rohan Mehta', 'Ananya Singh', 'Vikram Nair',
    'Neha Gupta', 'Rahul Verma', 'Pooja Iyer', 'Aditya Kumar', 'Kavya Reddy',
    'Siddharth Joshi', 'Divya Kapoor', 'Amit Tiwari', 'Shreya Bose', 'Karan Malhotra'
]

LOCATIONS = [
    {'city': 'Mumbai',        'country': 'India',          'lat': 19.076,  'lng': 72.877},
    {'city': 'Delhi',         'country': 'India',          'lat': 28.613,  'lng': 77.209},
    {'city': 'Lagos',         'country': 'Nigeria',        'lat': 6.524,   'lng': 3.379},
    {'city': 'Moscow',        'country': 'Russia',         'lat': 55.755,  'lng': 37.617},
    {'city': 'Beijing',       'country': 'China',          'lat': 39.904,  'lng': 116.407},
    {'city': 'São Paulo',     'country': 'Brazil',         'lat': -23.550, 'lng': -46.633},
    {'city': 'London',        'country': 'United Kingdom', 'lat': 51.507,  'lng': -0.127},
    {'city': 'New York',      'country': 'United States',  'lat': 40.712,  'lng': -74.005},
    {'city': 'Nairobi',       'country': 'Kenya',          'lat': -1.286,  'lng': 36.820},
    {'city': 'Bucharest',     'country': 'Romania',        'lat': 44.426,  'lng': 26.103},
    {'city': 'Bangalore',     'country': 'India',          'lat': 12.971,  'lng': 77.594},
    {'city': 'Jakarta',       'country': 'Indonesia',      'lat': -6.208,  'lng': 106.845},
]

DEVICES = [
    'Chrome / Windows 11', 'Safari / macOS', 'Firefox / Linux',
    'Unknown Android Device', 'Unknown iOS Device', 'Edge / Windows 10',
    'Opera / Ubuntu', 'Unknown Device'
]

IPS = ['192.168.1.', '45.33.32.', '198.51.100.', '203.0.113.', '172.16.0.', '10.0.0.', '185.220.101.', '91.108.4.']

ALERT_TEMPLATES = [
    {
        'title': 'High Risk Login Detected',
        'type': 'login',
        'reasons': ['Unknown device used', 'Login from new country', 'Login at unusual hour (3 AM)', '3 failed attempts before success'],
        'action': 'Verify account identity before allowing further access.',
        'shap': [
            {'factor': 'Unknown Device', 'contribution': 0.31, 'direction': 'positive'},
            {'factor': 'New Location', 'contribution': 0.28, 'direction': 'positive'},
            {'factor': 'Unusual Login Hour', 'contribution': 0.19, 'direction': 'positive'},
            {'factor': 'Failed Login Attempts', 'contribution': 0.14, 'direction': 'positive'},
        ],
    },
    {
        'title': 'Suspicious Transaction Flagged',
        'type': 'transaction',
        'reasons': ['Transaction amount far exceeds user average', 'New payment method detected', 'Foreign currency transaction'],
        'action': 'Block transaction and request identity verification.',
        'shap': [
            {'factor': 'Amount vs Average', 'contribution': 0.42, 'direction': 'positive'},
            {'factor': 'New Payment Method', 'contribution': 0.24, 'direction': 'positive'},
            {'factor': 'Foreign Currency', 'contribution': 0.18, 'direction': 'positive'},
            {'factor': 'Merchant Category', 'contribution': -0.06, 'direction': 'negative'},
        ],
    },
    {
        'title': 'Network Intrusion Attempt',
        'type': 'intrusion',
        'reasons': ['Port scan detected on multiple ports', 'High SYN error rate (88%)', 'Rapid connection attempts from single IP'],
        'action': 'Block source IP and escalate to network team.',
        'shap': [
            {'factor': 'SYN Error Rate', 'contribution': 0.45, 'direction': 'positive'},
            {'factor': 'Connection Count', 'contribution': 0.32, 'direction': 'positive'},
            {'factor': 'Source Bytes', 'contribution': 0.18, 'direction': 'positive'},
            {'factor': 'Protocol', 'contribution': 0.09, 'direction': 'positive'},
        ],
    },
    {
        'title': 'Impossible Travel Detected',
        'type': 'fraud',
        'reasons': ['Login from India at 8:00 PM', 'Login from USA at 8:45 PM — physically impossible', '45 minutes between logins, 13,000 km apart'],
        'action': 'Temporarily suspend session and verify user identity.',
        'shap': [
            {'factor': 'Impossible Travel', 'contribution': 0.55, 'direction': 'positive'},
            {'factor': 'Location Delta', 'contribution': 0.28, 'direction': 'positive'},
            {'factor': 'Time Between Logins', 'contribution': 0.12, 'direction': 'positive'},
            {'factor': 'Active Sessions', 'contribution': 0.07, 'direction': 'positive'},
        ],
    },
    {
        'title': 'Multiple Rapid Transactions',
        'type': 'transaction',
        'reasons': ['7 transactions within 3 minutes', 'All transactions to different merchants', 'Pattern consistent with card testing attack'],
        'action': 'Freeze card temporarily and notify card holder.',
        'shap': [
            {'factor': 'Transaction Velocity', 'contribution': 0.38, 'direction': 'positive'},
            {'factor': 'Unique Merchants', 'contribution': 0.29, 'direction': 'positive'},
            {'factor': 'Small Amounts', 'contribution': 0.21, 'direction': 'positive'},
            {'factor': 'Time of Day', 'contribution': 0.08, 'direction': 'positive'},
        ],
    },
]

def seed_database(db: Session):
    """Seed the SQLite database with realistic mock data if empty."""
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        return

    print("Seeding database...")

    # 1. Create Users
    hashed_pwd = hash_password("Password@1234")
    db_users = []

    # Admin User
    admin = User(
        id=str(uuid.uuid4()),
        name="Admin User",
        email="admin@sentinel.ai",
        role="admin",
        password_hash=hashed_pwd,
        is_active=True,
        risk_score=5,
        risk_level="low",
        location="Mumbai, India",
        device="Chrome / Windows 11",
        ip_address="192.168.1.1",
        total_alerts=0,
        open_alerts=0,
        joined_at=datetime.now(timezone.utc) - timedelta(days=60)
    )
    db.add(admin)
    db_users.append(admin)

    # Monitored Users from USER_NAMES list
    for i, name in enumerate(USER_NAMES):
        role = "analyst" if i < 2 else "user"
        email = name.lower().replace(' ', '.') + '@email.com'
        
        # Give Aryan Sharma a predictable email so the frontend can login
        if name == 'Aryan Sharma':
            email = "aryan.sharma@email.com"

        score = random.randint(0, 100)
        level = "low" if score <= 30 else "medium" if score <= 60 else "high" if score <= 80 else "critical"
        loc = random.choice(LOCATIONS)

        user = User(
            id=str(uuid.uuid4()),
            name=name,
            email=email,
            role=role,
            password_hash=hashed_pwd,
            is_active=True,
            risk_score=score,
            risk_level=level,
            location=f"{loc['city']}, {loc['country']}",
            device=random.choice(DEVICES),
            ip_address=random.choice(IPS) + str(random.randint(1, 254)),
            total_alerts=random.randint(0, 25),
            open_alerts=random.randint(0, 8),
            last_login=datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 48)),
            joined_at=datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365))
        )
        db.add(user)
        db_users.append(user)

    db.commit()
    print(f"Created {len(db_users)} users.")

    # Refresh users to load IDs
    for u in db_users:
        db.refresh(u)

    # Find specific users
    aryan_user = next((u for u in db_users if u.name == "Aryan Sharma"), db_users[1])

    # 2. Create Events (200+)
    db_events = []
    types = ['fraud', 'intrusion', 'login', 'transaction', 'system']
    sources = ['web', 'mobile', 'api', 'internal']

    for i in range(250):
        user = random.choice(db_users)
        loc = random.choice(LOCATIONS)
        score = random.randint(0, 100)
        level = "low" if score <= 30 else "medium" if score <= 60 else "high" if score <= 80 else "critical"
        
        # Let's override some event data for Aryan Sharma so his trend chart is pretty
        if i % 8 == 0:
            user = aryan_user
        
        event_type = random.choice(types)
        amount = float(random.randint(100, 200000)) if event_type in ['transaction', 'fraud'] else None
        
        event = Event(
            id=str(uuid.uuid4()),
            user_id=user.id,
            type=event_type,
            ip_address=random.choice(IPS) + str(random.randint(1, 254)),
            location=f"{loc['city']}, {loc['country']}",
            device=random.choice(DEVICES),
            user_agent="Mozilla/5.0 ...",
            amount=amount,
            merchant="Swiggy" if random.random() > 0.5 else "Amazon",
            risk_score=score,
            risk_level=level,
            is_anomaly=score > 60,
            raw_features=json.dumps({"source": random.choice(sources), "event_type": event_type}),
            timestamp=datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 720))
        )
        db.add(event)
        db_events.append(event)

    db.commit()
    print(f"Created {len(db_events)} events.")

    # Refresh events
    for ev in db_events:
        db.refresh(ev)

    # 3. Create Alerts (100+)
    db_alerts = []
    statuses = ['open', 'open', 'open', 'resolved', 'dismissed']

    for i in range(120):
        template = random.choice(ALERT_TEMPLATES)
        user = random.choice(db_users)
        
        # Link some alerts to Aryan Sharma
        if i % 6 == 0:
            user = aryan_user
            
        loc = random.choice(LOCATIONS)
        score = random.randint(35, 99)
        level = "medium" if score <= 60 else "high" if score <= 80 else "critical"
        status = random.choice(statuses)
        
        # Find a random event from the same user to link
        user_events = [e for e in db_events if e.user_id == user.id]
        event_link_id = user_events[0].id if user_events else None
        
        resolved_at = None
        resolved_by = None
        if status == 'resolved':
            resolved_at = datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 24))
            resolved_by = admin.id

        alert = Alert(
            id=str(uuid.uuid4()),
            user_id=user.id,
            event_id=event_link_id,
            title=template['title'],
            description=f"Anomalous activity detected for user {user.name}. Immediate review recommended.",
            type=template['type'],
            severity=level,
            status=status,
            risk_score=score,
            ip_address=random.choice(IPS) + str(random.randint(1, 254)),
            location=f"{loc['city']}, {loc['country']}",
            device=random.choice(DEVICES),
            shap_values=json.dumps(template['shap']),
            recommendation=template['action'],
            resolved_at=resolved_at,
            resolved_by=resolved_by,
            created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 168))
        )
        db.add(alert)
        db_alerts.append(alert)

    db.commit()
    print(f"Created {len(db_alerts)} alerts.")

    # 4. Create Reports
    db_reports = []
    report_types = ['daily', 'weekly', 'monthly', 'custom']
    formats = ['pdf', 'csv']

    for i in range(6):
        report_type = random.choice(report_types)
        fmt = random.choice(formats)
        report = Report(
            id=str(uuid.uuid4()),
            title=f"{report_type.capitalize()} Security Report",
            type=report_type,
            date_from=(datetime.now(timezone.utc) - timedelta(days=10)).strftime("%Y-%m-%d"),
            date_to=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            generated_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 15)),
            generated_by=admin.id,
            format=fmt,
            total_alerts=random.randint(10, 100),
            critical_alerts=random.randint(1, 15),
            summary=f"This report covers security analytics from the selected dates. Model accuracy remained stable."
        )
        db.add(report)
        db_reports.append(report)

    db.commit()
    print(f"Created {len(db_reports)} reports.")
    print("Database seeding completed successfully!")
