
from database import engine, Base
from models.db_models import User, Dataset, Report, DashboardShare
from models.dashboard_model import Dashboard

def init_db():
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
