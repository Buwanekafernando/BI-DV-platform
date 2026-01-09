from fastapi import APIRouter, Depends

from utils.auth import get_current_user
import json

router = APIRouter(prefix="/share")

@router.post("/dashboard")
def share_dashboard(data: dict, user=Depends(get_current_user)):
    query = """
        INSERT INTO dashboard_shares (dashboard_id, shared_with_user_id, permission)
        VALUES (?, ?, ?)
    """
    execute_query(query, (
        data["dashboard_id"],
        data["user_id"],
        data.get("permission", "view")
    ))

    return {"status": "shared"}

# Retrieve dashboards shared with the current user

@router.get("/dashboard")
def get_shared_dashboards(user=Depends(get_current_user)):
    query = """
        SELECT d.*
        FROM dashboards d
        JOIN dashboard_shares s ON d.id = s.dashboard_id
        WHERE s.shared_with_user_id = ?
    """
    rows = fetch_all(query, (user["id"],))
    # Parse JSON fields for each dashboard
    for row in rows:
        row = dict(row)
        row['filters'] = json.loads(row['filters']) if row['filters'] else None
        row['charts'] = json.loads(row['charts']) if row['charts'] else None
        row['layout'] = json.loads(row['layout']) if row['layout'] else None
    return rows



