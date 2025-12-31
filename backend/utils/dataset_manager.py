import os
import json
from typing import Optional, List, Dict
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.db_models import Dataset, User
from config import settings

class DatasetManager:
    """Manage dataset access and metadata"""
    
    @staticmethod
    def get_dataset_path(dataset_id: str) -> str:
        """Get the file path for a dataset"""
        return os.path.join(settings.UPLOAD_DIR, f"{dataset_id}.csv")
    
    @staticmethod
    def verify_dataset_access(db: Session, dataset_id: str, user: User) -> Dataset:
        """Verify user has access to dataset"""
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        if dataset.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this dataset"
            )
        
        return dataset
    
    @staticmethod
    def get_user_datasets(db: Session, user_id: int) -> List[Dataset]:
        """Get all datasets for a user"""
        return db.query(Dataset).filter(Dataset.user_id == user_id).all()
    
    @staticmethod
    def delete_dataset(db: Session, dataset_id: str, user: User) -> bool:
        """Delete a dataset and its file"""
        dataset = DatasetManager.verify_dataset_access(db, dataset_id, user)
        
        # Delete file
        file_path = dataset.file_path
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete database record
        db.delete(dataset)
        db.commit()
        
        return True
    
    @staticmethod
    def cleanup_orphaned_files():
        """Clean up files without database records"""
        # This can be run periodically to clean up orphaned files
        pass
