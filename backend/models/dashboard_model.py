from sqlalchemy import Column, String, JSON, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String, nullable=False)
    dataset_id = Column(UUID(as_uuid=True), nullable=False)
    filters = Column(JSON)
    charts = Column(JSON)
    layout = Column(JSON)
    created_at = Column(TIMESTAMP)
