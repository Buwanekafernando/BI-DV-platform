from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Create engine
engine = create_engine(settings.DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def execute_query(query, params=None):
    with engine.connect() as conn:
        if params is None:
            result = conn.execute(text(query))
        elif isinstance(params, (list, tuple)):
            result = conn.exec_driver_sql(query, params)
        else:
            result = conn.execute(text(query), params)
        conn.commit()
        return result

def fetch_all(query, params=None):
    with engine.connect() as conn:
        if params is None:
            result = conn.execute(text(query))
        elif isinstance(params, (list, tuple)):
            result = conn.exec_driver_sql(query, params)
        else:
            result = conn.execute(text(query), params)
        return [dict(row._mapping) for row in result.fetchall()]

def fetch_one(query, params=None):
    with engine.connect() as conn:
        if params is None:
            result = conn.execute(text(query))
        elif isinstance(params, (list, tuple)):
            result = conn.exec_driver_sql(query, params)
        else:
            result = conn.execute(text(query), params)
        row = result.fetchone()
        return dict(row._mapping) if row else None
