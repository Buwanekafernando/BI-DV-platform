from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.sql import func
from database import Base

class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(UNIQUEIDENTIFIER, primary_key=True, server_default=func.newid())
    user_id = Column(UNIQUEIDENTIFIER, nullable=False)
    name = Column(String, nullable=False)
    dataset_id = Column(UNIQUEIDENTIFIER, nullable=False)
    filters = Column(String)  # NVARCHAR(MAX) for JSON
    charts = Column(String)   # NVARCHAR(MAX) for JSON
    layout = Column(String)   # NVARCHAR(MAX) for JSON
    created_at = Column(DateTime, server_default=func.now())
