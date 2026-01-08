import json
from database import execute_query, fetch_all, fetch_one

def save_dashboard(dashboard, user):
    query = """
        INSERT INTO dashboards (user_id, name, dataset_id, filters, charts, layout)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """

    dashboard_id = execute_query(
        query,
        (
            user["id"],
            dashboard.name,
            dashboard.dataset_id,
            json.dumps(dashboard.filters),
            json.dumps([c.dict() for c in dashboard.charts]),
            json.dumps(dashboard.layout)
        )
    )

    return {"dashboard_id": dashboard_id}

def list_dashboards(user):
    query = """
        SELECT id, name, created_at
        FROM dashboards
        WHERE user_id = %s
        ORDER BY created_at DESC
    """
    return fetch_all(query, (user["id"],))

def get_dashboard(dashboard_id, user):
    query = """
        SELECT *
        FROM dashboards
        WHERE id = %s AND user_id = %s
    """
    return fetch_one(query, (dashboard_id, user["id"]))
