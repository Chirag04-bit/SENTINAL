import csv
import os
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.alert import Alert

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "reports"))

def ensure_reports_dir():
    """Create the reports directory if it doesn't exist."""
    os.makedirs(REPORTS_DIR, exist_ok=True)

def fetch_report_data(db: Session, date_from_str: str, date_to_str: str) -> tuple[list[Event], list[Alert]]:
    """Fetch all events and alerts within the selected date range."""
    # Convert dates
    try:
        from_date = datetime.strptime(date_from_str, "%Y-%m-%d")
        to_date = datetime.strptime(date_to_str, "%Y-%m-%d") + timedelta(days=1)  # Add 1 day
    except ValueError:
        from_date = datetime.now() - timedelta(days=7)
        to_date = datetime.now()

    events = db.query(Event).filter(Event.timestamp >= from_date, Event.timestamp <= to_date).all()
    alerts = db.query(Alert).filter(Alert.created_at >= from_date, Alert.created_at <= to_date).all()

    return events, alerts

def generate_report_file(db: Session, report_id: str, report_type: str, date_from: str, date_to: str, format_type: str) -> str:
    """
    Generate a CSV or PDF report file and return the absolute path.
    """
    ensure_reports_dir()
    events, alerts = fetch_report_data(db, date_from, date_to)

    filename = f"report_{report_id}.{format_type.lower()}"
    filepath = os.path.join(REPORTS_DIR, filename)

    if format_type.lower() == "csv":
        generate_csv(filepath, report_type, date_from, date_to, events, alerts)
    else:
        generate_pdf(filepath, report_type, date_from, date_to, events, alerts)

    return filepath

def generate_csv(filepath: str, report_type: str, date_from: str, date_to: str, events: list[Event], alerts: list[Alert]):
    """Write alert details to a CSV file."""
    with open(filepath, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        # Summary metadata
        writer.writerow(["SENTINEL SECURITY REPORT"])
        writer.writerow(["Report Type", report_type.upper()])
        writer.writerow(["Date Range", f"{date_from} to {date_to}"])
        writer.writerow(["Generated At", datetime.now().isoformat()])
        writer.writerow(["Total Events Processed", len(events)])
        writer.writerow(["Total Alerts Generated", len(alerts)])
        writer.writerow([])
        
        # Alerts Table
        writer.writerow(["ALERTS LOG"])
        writer.writerow(["Alert ID", "Title", "Type", "Severity", "Risk Score", "IP Address", "Location", "Timestamp", "Status"])
        for a in alerts:
            writer.writerow([
                a.id,
                a.title,
                a.type,
                a.severity,
                a.risk_score,
                a.ip_address or "N/A",
                a.location or "N/A",
                a.created_at.isoformat(),
                a.status
            ])

def generate_pdf(filepath: str, report_type: str, date_from: str, date_to: str, events: list[Event], alerts: list[Alert]):
    """Generate a clean, professional PDF report using ReportLab."""
    doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()
    
    # Custom Palette
    navy = colors.HexColor("#0F1629")
    accent = colors.HexColor("#06B6D4")
    slate = colors.HexColor("#64748B")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=navy,
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=accent,
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = styles['Normal']

    # Title & Metadata
    story.append(Paragraph("🛡️ SENTINEL Security Summary", title_style))
    story.append(Paragraph(f"<b>Report Type:</b> {report_type.upper()}", body_style))
    story.append(Paragraph(f"<b>Period:</b> {date_from} to {date_to}", body_style))
    story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    story.append(Spacer(1, 15))

    # Summary Stats
    story.append(Paragraph("KPI Summary", h2_style))
    kpi_data = [
        ["Metric", "Value"],
        ["Total Events Processed", str(len(events))],
        ["Total Alerts Triggered", str(len(alerts))],
        ["Critical Alerts", str(len([a for a in alerts if a.severity == "critical"]))],
        ["High Severity Alerts", str(len([a for a in alerts if a.severity == "high"]))],
        ["Resolved Alerts", str(len([a for a in alerts if a.status == "resolved"]))],
    ]
    t_summary = Table(kpi_data, colWidths=[200, 100])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), navy),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.white),
        ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, slate),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 20))

    # Alerts Log (top 15 for space constraints in PDF)
    story.append(Paragraph("Recent Triggered Alerts (Top 15)", h2_style))
    alert_headers = ["ID", "Title", "Severity", "Risk", "Location", "Status"]
    alert_data = [alert_headers]
    
    for a in alerts[:15]:
        alert_data.append([
            a.id[:8],
            a.title[:25],
            a.severity.upper(),
            str(a.risk_score),
            (a.location or "Unknown")[:15],
            a.status.capitalize()
        ])

    t_alerts = Table(alert_data, colWidths=[60, 160, 60, 40, 100, 60])
    t_alerts.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
    ]))
    story.append(t_alerts)

    # Build Doc
    doc.build(story)
