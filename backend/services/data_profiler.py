import pandas as pd
import numpy as np
from typing import Dict, List, Any
from datetime import datetime

class DataProfiler:
    """Service for profiling CSV datasets"""
    
    @staticmethod
    def profile_dataset(file_path: str) -> Dict[str, Any]:
        """Generate comprehensive profile of a dataset"""
        df = pd.read_csv(file_path)
        
        profile = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": [],
            "numeric_columns": [],
            "categorical_columns": [],
            "date_columns": []
        }
        
        for column in df.columns:
            col_profile = DataProfiler._profile_column(df, column)
            profile["columns"].append(col_profile)
            
            # Categorize columns
            if col_profile["dtype"] in ["int64", "float64"]:
                profile["numeric_columns"].append(column)
            elif col_profile.get("is_date", False):
                profile["date_columns"].append(column)
            else:
                profile["categorical_columns"].append(column)
        
        return profile
    
    @staticmethod
    def _profile_column(df: pd.DataFrame, column: str) -> Dict[str, Any]:
        """Profile a single column"""
        col_data = df[column]
        
        profile = {
            "name": column,
            "dtype": str(col_data.dtype),
            "missing_count": int(col_data.isna().sum()),
            "missing_percentage": float(col_data.isna().sum() / len(col_data) * 100),
            "unique_count": int(col_data.nunique()),
            "sample_values": col_data.dropna().head(5).tolist()
        }
        
        # Check if it's a date column
        if DataProfiler._is_date_column(col_data):
            profile["is_date"] = True
            profile["dtype"] = "datetime"
        
        # Add numeric statistics
        if col_data.dtype in ["int64", "float64"]:
            profile.update({
                "mean": float(col_data.mean()) if not col_data.isna().all() else None,
                "median": float(col_data.median()) if not col_data.isna().all() else None,
                "std": float(col_data.std()) if not col_data.isna().all() else None,
                "min": float(col_data.min()) if not col_data.isna().all() else None,
                "max": float(col_data.max()) if not col_data.isna().all() else None,
                "q25": float(col_data.quantile(0.25)) if not col_data.isna().all() else None,
                "q75": float(col_data.quantile(0.75)) if not col_data.isna().all() else None
            })
        
        # Add categorical statistics
        elif col_data.dtype == "object":
            value_counts = col_data.value_counts().head(10)
            profile["top_values"] = {
                str(k): int(v) for k, v in value_counts.items()
            }
        
        return profile
    
    @staticmethod
    def _is_date_column(col_data: pd.Series) -> bool:
        """Check if a column contains date values"""
        if col_data.dtype == "object":
            try:
                # Try to parse a sample of non-null values
                sample = col_data.dropna().head(10)
                pd.to_datetime(sample, errors='raise')
                return True
            except:
                return False
        return False
    
    @staticmethod
    def get_row_count(file_path: str) -> int:
        """Get the number of rows in a CSV file"""
        df = pd.read_csv(file_path)
        return len(df)
