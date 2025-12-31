import pandas as pd
from typing import Any, List
from fastapi import HTTPException
from models.schemas import FilterCondition

def validate_csv_file(file_path: str, max_size_mb: int = 50) -> bool:
    """Validate CSV file size and format"""
    import os
    
    # Check file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check file size
    file_size = os.path.getsize(file_path)
    if file_size > max_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {max_size_mb}MB limit"
        )
    
    # Try to read CSV
    try:
        pd.read_csv(file_path, nrows=5)
        return True
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid CSV file: {str(e)}"
        )

def apply_filters(df: pd.DataFrame, filters: List[FilterCondition]) -> pd.DataFrame:
    """Apply filters to a DataFrame"""
    if not filters:
        return df
    
    filtered_df = df.copy()
    
    for filter_cond in filters:
        column = filter_cond.column
        operator = filter_cond.operator
        value = filter_cond.value
        
        if column not in filtered_df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Column '{column}' not found in dataset"
            )
        
        try:
            if operator == "eq":
                filtered_df = filtered_df[filtered_df[column] == value]
            elif operator == "ne":
                filtered_df = filtered_df[filtered_df[column] != value]
            elif operator == "gt":
                filtered_df = filtered_df[filtered_df[column] > value]
            elif operator == "lt":
                filtered_df = filtered_df[filtered_df[column] < value]
            elif operator == "gte":
                filtered_df = filtered_df[filtered_df[column] >= value]
            elif operator == "lte":
                filtered_df = filtered_df[filtered_df[column] <= value]
            elif operator == "in":
                filtered_df = filtered_df[filtered_df[column].isin(value)]
            elif operator == "between":
                if not isinstance(value, list) or len(value) != 2:
                    raise ValueError("Between operator requires a list of two values")
                filtered_df = filtered_df[
                    (filtered_df[column] >= value[0]) & 
                    (filtered_df[column] <= value[1])
                ]
            else:
                raise ValueError(f"Unsupported operator: {operator}")
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error applying filter on column '{column}': {str(e)}"
            )
    
    return filtered_df

def sanitize_column_name(name: str) -> str:
    """Sanitize column names for safe usage"""
    return name.strip().replace(" ", "_").replace(".", "_")

def validate_columns(df: pd.DataFrame, columns: List[str]) -> bool:
    """Validate that columns exist in DataFrame"""
    missing_columns = [col for col in columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Columns not found: {', '.join(missing_columns)}"
        )
    return True
