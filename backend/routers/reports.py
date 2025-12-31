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
from services.report_generator import ReportGenerator
from config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/{dataset_id}/csv", response_model=ReportResponse)
async def generate_csv_report(
    dataset_id: str,
    request: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate CSV export of dataset"""
    dataset = DatasetManager.verify_dataset_access(db, dataset_id, current_user)
    
    try:
        report_id = str(uuid.uuid4())
        output_filename = f"{report_id}.csv"
        
        file_path = ReportGenerator.generate_csv_report(
            dataset.file_path,
            output_filename,
            request.filters
        )
        
        # Save report metadata
        report = Report(
            id=report_id,
            title=request.title,
            file_path=file_path,
            user_id=current_user.id
        )
        db.add(report)
        db.commit()
        
        return ReportResponse(
            report_id=report_id,
            title=request.title,
            file_path=file_path,
            download_url=f"/reports/download/{output_filename}",
            created_at=report.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating CSV report: {str(e)}"
        )

@router.post("/{dataset_id}/pdf", response_model=ReportResponse)
async def generate_pdf_report(
    dataset_id: str,
    request: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate PDF report with charts and statistics"""
    dataset = DatasetManager.verify_dataset_access(db, dataset_id, current_user)
    
    try:
        report_id = str(uuid.uuid4())
        output_filename = f"{report_id}.pdf"
        
        file_path = ReportGenerator.generate_pdf_report(
            dataset.file_path,
            output_filename,
            request.title,
            request.chart_configs if request.include_charts else None,
            request.filters
        )
        
        # Save report metadata
        report = Report(
            id=report_id,
            title=request.title,
            file_path=file_path,
            user_id=current_user.id
        )
        db.add(report)
        db.commit()
        
        return ReportResponse(
            report_id=report_id,
            title=request.title,
            file_path=file_path,
            download_url=f"/reports/download/{output_filename}",
            created_at=report.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF report: {str(e)}"
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
