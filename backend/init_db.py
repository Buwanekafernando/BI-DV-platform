"""Initial database setup script

This script creates the database tables and can be run manually
if needed. The main.py application will also create tables on startup.
"""

from database import engine, Base
from models.db_models import User, Dataset, Report

def init_db():
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
