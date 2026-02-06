
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add backend to path to import config
sys.path.append(os.path.join(os.getcwd(), "backend"))
from config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_datasets():
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT id, name, file_path FROM datasets"))
        print("ID | Name | File Path | Exists")
        print("-" * 60)
        for row in result:
            exists = os.path.exists(row[2])
            print(f"{row[0]} | {row[1]} | {row[2]} | {exists}")
    finally:
        db.close()

if __name__ == "__main__":
    check_datasets()
