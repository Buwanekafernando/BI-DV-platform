import pandas as pd
from typing import List, Dict, Any
from models.schemas import QueryRequest, AggregationType, FilterCondition
from utils.validators import apply_filters, validate_columns

class QueryEngine:
    """Service for executing queries on CSV datasets"""
    
    @staticmethod
    def execute_query(file_path: str, query: QueryRequest) -> Dict[str, Any]:
        """Execute a query on a dataset"""
        # Load data
        df = pd.read_csv(file_path)
        
        # Apply filters
        if query.filters:
            df = apply_filters(df, query.filters)
        
        # Apply grouping and aggregations
        if query.group_by and query.aggregations:
            df = QueryEngine._apply_aggregations(df, query.group_by, query.aggregations)
        elif query.aggregations:
            # Aggregations without grouping
            df = QueryEngine._apply_global_aggregations(df, query.aggregations)
        
        # Apply limit
        if query.limit:
            df = df.head(query.limit)
        
        # Convert to response format
        return {
            "data": df.to_dict(orient="records"),
            "total_rows": len(df),
            "columns": df.columns.tolist()
        }
    
    @staticmethod
    def _apply_aggregations(
        df: pd.DataFrame,
        group_by: List[str],
        aggregations: List[Any]
    ) -> pd.DataFrame:
        """Apply aggregations with grouping"""
        validate_columns(df, group_by)
        
        # Build aggregation dictionary
        agg_dict = {}
        for agg in aggregations:
            column = agg.column
            function = agg.function.value
            
            if column not in df.columns:
                continue
            
            if function == "sum":
                agg_dict[column] = "sum"
            elif function == "avg":
                agg_dict[column] = "mean"
            elif function == "count":
                agg_dict[column] = "count"
            elif function == "min":
                agg_dict[column] = "min"
            elif function == "max":
                agg_dict[column] = "max"
            elif function == "median":
                agg_dict[column] = "median"
            elif function == "std":
                agg_dict[column] = "std"
        
        # Group and aggregate
        grouped = df.groupby(group_by).agg(agg_dict).reset_index()
        
        # Rename columns to include aggregation function
        for agg in aggregations:
            column = agg.column
            function = agg.function.value
            if column in grouped.columns and column not in group_by:
                grouped.rename(columns={column: f"{column}_{function}"}, inplace=True)
        
        return grouped
    
    @staticmethod
    def _apply_global_aggregations(
        df: pd.DataFrame,
        aggregations: List[Any]
    ) -> pd.DataFrame:
        """Apply aggregations without grouping (global aggregations)"""
        results = {}
        
        for agg in aggregations:
            column = agg.column
            function = agg.function.value
            
            if column not in df.columns:
                continue
            
            if function == "sum":
                results[f"{column}_sum"] = [df[column].sum()]
            elif function == "avg":
                results[f"{column}_avg"] = [df[column].mean()]
            elif function == "count":
                results[f"{column}_count"] = [df[column].count()]
            elif function == "min":
                results[f"{column}_min"] = [df[column].min()]
            elif function == "max":
                results[f"{column}_max"] = [df[column].max()]
            elif function == "median":
                results[f"{column}_median"] = [df[column].median()]
            elif function == "std":
                results[f"{column}_std"] = [df[column].std()]
        
        return pd.DataFrame(results)
    
    @staticmethod
    def preview_data(file_path: str, limit: int = 100) -> Dict[str, Any]:
        """Preview first N rows of a dataset"""
        df = pd.read_csv(file_path, nrows=limit)
        
        return {
            "data": df.to_dict(orient="records"),
            "total_rows": len(df),
            "columns": df.columns.tolist()
        }
