import json
from database import execute_query, fetch_all, fetch_one

def save_dashboard(dashboard, user):
    query = """
        INSERT INTO dashboards (user_id, name, dataset_id, filters, charts, layout)
        OUTPUT INSERTED.id
        VALUES (?, ?, ?, ?, ?, ?)
    """

    result = execute_query(
        query,
        (
            user["id"],
            dashboard.name,
            dashboard.dataset_id,
            json.dumps(dashboard.filters) if dashboard.filters else None,
            json.dumps([c.dict() for c in dashboard.charts]) if dashboard.charts else None,
            json.dumps(dashboard.layout) if dashboard.layout else None
        )
    )

    dashboard_id = result.fetchone()[0]

    return {"dashboard_id": dashboard_id}

def list_dashboards(user):
    query = """
        SELECT id, name, created_at
        FROM dashboards
        WHERE user_id = ?
        ORDER BY created_at DESC
    """
    return fetch_all(query, (user["id"],))

def get_dashboard(dashboard_id, user):
    query = """
        SELECT *
        FROM dashboards
        WHERE id = ? AND user_id = ?
    """
    row = fetch_one(query, (dashboard_id, user["id"]))
    if row:
        # Parse JSON fields
        row = dict(row)
        row['filters'] = json.loads(row['filters']) if row['filters'] else None
        row['charts'] = json.loads(row['charts']) if row['charts'] else None
        row['layout'] = json.loads(row['layout']) if row['layout'] else None
    return row
