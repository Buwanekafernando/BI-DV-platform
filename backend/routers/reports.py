from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
from database import get_db
from models.db_models import User, Report
from models.schemas import ReportRequest, ReportResponse
from utils.auth import get_current_user
from utils.dataset_manager import DatasetManager
from services.dashboard_service import get_dashboard
from config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/{dashboard_id}/pdf", response_model=ReportResponse)
async def generate_pdf_report(
    dashboard_id: str,
    request: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate PDF report of dashboard"""
    dashboard = get_dashboard(dashboard_id, str(current_user.id))
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    try:
        report_id = str(uuid.uuid4())
        output_filename = f"{report_id}.pdf"
        
        file_path = os.path.join(settings.REPORT_DIR, output_filename)
        # Generate PDF using dashboard data
        # For now, placeholder
        
        # Save report metadata
        report = Report(
            id=report_id,
            dashboard_id=dashboard_id,
            report_type=request.report_type,
            file_path=file_path
        )
        db.add(report)
        db.commit()
        
        return ReportResponse(
            report_id=report_id,
            report_type=request.report_type,
            file_path=file_path,
            created_at=report.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating report: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_report(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Download a generated report"""
    file_path = os.path.join(settings.REPORT_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )
