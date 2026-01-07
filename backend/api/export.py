from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from app.services.pdf_service import generate_dashboard_pdf
from app.services.jwt_dependency import get_current_user
import os

router = APIRouter(prefix="/export")

@router.get("/dashboard/{dashboard_id}/pdf")
def export_dashboard_pdf(
    dashboard_id: str,
    user=Depends(get_current_user)
):
    dashboard = get_dashboard_from_db(dashboard_id, user["id"])

    output_path = f"exports/dashboard_{dashboard_id}.pdf"
    os.makedirs("exports", exist_ok=True)

    generate_dashboard_pdf(dashboard, output_path)

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename="dashboard.pdf"
    )
