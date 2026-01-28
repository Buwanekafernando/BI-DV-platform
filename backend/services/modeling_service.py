import pandas as pd
from typing import List, Dict, Any

class ModelingService:
    @staticmethod
    def apply_measures(df: pd.DataFrame, measures: List[Dict[str, Any]]) -> pd.DataFrame:
        """Add row-level calculated measures to the DataFrame"""
        for measure in measures:
            name = measure.get("name")
            formula = measure.get("formula")
            
            # Simple check if it's an aggregate measure (has SUM, AVG, COUNT, etc.)
            # Aggregate measures are evaluated AFTER grouping in the QueryEngine
            is_aggregate = any(agg in formula.upper() for agg in ["SUM(", "AVG(", "COUNT(", "MIN(", "MAX("])
            
            if is_aggregate:
                continue

            try:
                # Row-level cross-column arithmetic
                df[name] = df.eval(formula)
            except Exception as e:
                print(f"Error calculating row-level measure {name}: {e}")
                
        return df

    @staticmethod
    def get_time_intelligence(df: pd.DataFrame, date_col: str) -> pd.DataFrame:
        """Add basic time intelligence columns if a date column is present"""
        if date_col in df.columns:
            try:
                dt = pd.to_datetime(df[date_col], errors='coerce')
                df[f"{date_col}_Year"] = dt.dt.year
                df[f"{date_col}_Month"] = dt.dt.month_name()
                df[f"{date_col}_Quarter"] = dt.dt.quarter.map(lambda x: f"Q{x}")
                df[f"{date_col}_DayOfWeek"] = dt.dt.day_name()
            except Exception as e:
                print(f"Error extracting time intelligence from {date_col}: {e}")
        return df
