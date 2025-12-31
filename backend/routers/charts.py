from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.db_models import User
from models.schemas import ChartRequest, ChartResponse
from utils.auth import get_current_user
from utils.dataset_manager import DatasetManager
from services.chart_formatter import ChartFormatter

router = APIRouter(prefix="/charts", tags=["Charts"])

@router.post("/{dataset_id}/bar", response_model=ChartResponse)
async def get_bar_chart(
    dataset_id: str,
    request: ChartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bar chart data"""
    dataset = DatasetManager.verify_dataset_access(db, dataset_id, current_user)
    
    try:
        chart_data = ChartFormatter.prepare_bar_chart(dataset.file_path, request)
        return chart_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating bar chart: {str(e)}"
        )

@router.post("/{dataset_id}/line", response_model=ChartResponse)
async def get_line_chart(
    dataset_id: str,
    request: ChartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get line chart data"""
    dataset = DatasetManager.verify_dataset_access(db, dataset_id, current_user)
    
    try:
        chart_data = ChartFormatter.prepare_line_chart(dataset.file_path, request)
        return chart_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating line chart: {str(e)}"
        )

@router.post("/{dataset_id}/pie", response_model=ChartResponse)
async def get_pie_chart(
    dataset_id: str,
    request: ChartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pie chart data"""
    dataset = DatasetManager.verify_dataset_access(db, dataset_id, current_user)
    
    try:
        chart_data = ChartFormatter.prepare_pie_chart(dataset.file_path, request)
        return chart_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating pie chart: {str(e)}"
        )

@router.post("/{dataset_id}/scatter", response_model=ChartResponse)
async def get_scatter_chart(
    dataset_id: str,
    request: ChartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get scatter plot data"""
    dataset = DatasetManager.verify_dataset_access(db, dataset_id, current_user)
    
    try:
        chart_data = ChartFormatter.prepare_scatter_chart(dataset.file_path, request)
        return chart_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating scatter plot: {str(e)}"
        )

@router.post("/{dataset_id}/heatmap", response_model=ChartResponse)
async def get_heatmap(
    dataset_id: str,
    request: ChartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get correlation heatmap data"""
    dataset = DatasetManager.verify_dataset_access(db, dataset_id, current_user)
    
    try:
        chart_data = ChartFormatter.prepare_heatmap(dataset.file_path, request)
        return chart_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating heatmap: {str(e)}"
        )
