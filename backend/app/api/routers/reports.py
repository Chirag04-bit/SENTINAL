import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.config.database import get_db
from app.models.user import User
from app.models.report import Report
from app.models.alert import Alert
from app.schemas.common import GenerateReportRequest, ReportResponse
from app.services import report_service
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/", response_model=list[ReportResponse], summary="List Reports")
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """**GET /reports** — Returns previously generated security reports."""
    reports = db.query(Report).order_by(Report.generated_at.desc()).all()
    return [ReportResponse.model_validate(r) for r in reports]

@router.post("/generate", response_model=ReportResponse, status_code=201, summary="Generate Report")
def generate_report(
    request: GenerateReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    **POST /reports/generate**
    Triggers CSV/PDF report building for the selected date range.
    """
    # Count stats in date range
    events, alerts = report_service.fetch_report_data(db, request.date_from, request.date_to)
    total_alerts = len(alerts)
    critical_alerts = len([a for a in alerts if a.severity == "critical"])
    
    # Create Report ORM Model
    report_title = f"{request.type.capitalize()} Security Report"
    
    db_report = Report(
        title=report_title,
        type=request.type,
        date_from=request.date_from,
        date_to=request.date_to,
        generated_by=current_user.id,
        format=request.format,
        total_alerts=total_alerts,
        critical_alerts=critical_alerts,
        summary=f"Report covering period {request.date_from} to {request.date_to}. Total Alerts: {total_alerts}, Critical: {critical_alerts}."
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # Actually write file
    try:
        report_service.generate_report_file(
            db=db,
            report_id=db_report.id,
            report_type=db_report.type,
            date_from=db_report.date_from,
            date_to=db_report.date_to,
            format_type=db_report.format
        )
    except Exception as e:
        # Cleanup DB entry if generation fails
        db.delete(db_report)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate physical report file: {e}"
        )
        
    return ReportResponse.model_validate(db_report)

@router.get("/{report_id}/download", summary="Download Report File")
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    **GET /reports/{id}/download**
    Downloads the physical CSV or PDF file for a generated report.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    filename = f"report_{report.id}.{report.format.lower()}"
    filepath = os.path.join(report_service.REPORTS_DIR, filename)
    
    # Generate file if not exists
    if not os.path.exists(filepath):
        try:
            report_service.generate_report_file(
                db=db,
                report_id=report.id,
                report_type=report.type,
                date_from=report.date_from,
                date_to=report.date_to,
                format_type=report.format
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File not found and regeneration failed: {e}")
            
    media_types = {
        "pdf": "application/pdf",
        "csv": "text/csv"
    }
    
    return FileResponse(
        path=filepath,
        media_type=media_types.get(report.format.lower(), "application/octet-stream"),
        filename=f"{report.title.replace(' ', '_')}.{report.format.lower()}"
    )
