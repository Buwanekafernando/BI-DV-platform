import pandas as pd
from typing import List, Dict, Any, Set
import re
from models.schemas import QueryRequest, AggregationType, FilterCondition
from utils.validators import apply_filters, validate_columns
from services.transformation_service import TransformationService
from services.modeling_service import ModelingService
import json

class QueryEngine:
    """Service for executing queries on CSV datasets"""
    
    @staticmethod
    def execute_query(
        file_path: str,
        query: QueryRequest,
        transformations: List[Dict[str, Any]] = None,
        measures: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a query on a dataset"""
        # Load data
        df = pd.read_csv(file_path)
        
        # Apply data transformations (Data Prep)
        if transformations:
            df = TransformationService.apply_transformations(df, transformations)
            
        # Apply row-level measures (Data Modeling)
        if measures:
            df = ModelingService.apply_measures(df, measures)
            
        # Apply filters
        if query.filters:
            df = apply_filters(df, query.filters)

        # Handle aggregate measures logic
        agg_measures = []
        if measures:
            for m in measures:
                formula = m.get("formula", "")
                is_aggregate = any(agg in formula.upper() for agg in ["SUM(", "AVG(", "COUNT(", "MIN(", "MAX("])
                if is_aggregate:
                    agg_measures.append(m)

        # If any requested aggregation is actually a measure, or we have aggregate measures to evaluate
        # we need to ensure all required raw aggregations are performed.
        
        # 1. Identify which measures are requested in the query
        requested_measure_names = [agg.column for agg in query.aggregations if any(m["name"] == agg.column for m in agg_measures)]
        active_agg_measures = [m for m in agg_measures if m["name"] in requested_measure_names]
        
        # 2. Extract dependencies for active aggregate measures
        # e.g. "SUM(Sales) / SUM(Qty)" -> [("Sales", "sum"), ("Qty", "sum")]
        internal_aggs = []
        if active_agg_measures:
             for m in active_agg_measures:
                 deps = re.findall(r'(\w+)\((\w+)\)', m["formula"])
                 for func, col in deps:
                     func_lower = func.lower()
                     if func_lower == "mean": func_lower = "avg"
                     internal_aggs.append(AggregationRequest(column=col, function=AggregationType(func_lower)))

        # 3. Build the full list of aggregations (User requested + internal dependencies)
        # Filter out the measures themselves from the first pass of aggregation
        base_aggs = [agg for agg in query.aggregations if not any(m["name"] == agg.column for m in agg_measures)]
        
        # Combine and deduplicate
        combined_aggs = list(base_aggs)
        for ia in internal_aggs:
            if not any(ba.column == ia.column and ba.function == ia.function for ba in combined_aggs):
                combined_aggs.append(ia)

        # Apply histogram binning if requested
        if query.is_histogram and combined_aggs:
            col = combined_aggs[0].column
            if col in df.columns:
                bins = query.histogram_bins or 10
                counts = df[col].value_counts(bins=bins, sort=False).reset_index()
                counts.columns = [col, f"{col}_count"]
                counts[col] = counts[col].astype(str)
                return {
                    "data": counts.to_dict(orient="records"),
                    "total_rows": len(counts),
                    "columns": counts.columns.tolist()
                }
        
        # Apply grouping and aggregations
        if query.group_by and combined_aggs:
            df = QueryEngine._apply_aggregations(df, query.group_by, combined_aggs)
        elif combined_aggs:
            df = QueryEngine._apply_global_aggregations(df, combined_aggs)
        
        # 4. Evaluate Aggregate Measures on the result
        if active_agg_measures:
            df = QueryEngine._evaluate_aggregate_measures(df, active_agg_measures)

        # 5. Final projection: only keep columns requested by the user
        # (group_by columns + specified aggregation results)
        final_cols = []
        if query.group_by:
            final_cols.extend(query.group_by)
        
        for agg in query.aggregations:
            if any(m["name"] == agg.column for m in agg_measures):
                # It's a measure
                final_cols.append(agg.column)
            else:
                # It's a standard aggregation
                final_cols.append(f"{agg.column}_{agg.function.value}")
        
        # Ensure only columns that exist in the result are kept
        final_cols = [c for c in final_cols if c in df.columns]
        if final_cols:
            df = df[final_cols]

        # Apply sorting
        if query.sort_by:
            sort_params = [(s.column, s.order == "asc") for s in query.sort_by if s.column in df.columns]
            if sort_params:
                 df = df.sort_values(
                     by=[p[0] for p in sort_params],
                     ascending=[p[1] for p in sort_params]
                 )

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
        
        # Build aggregation mapping: {column: [function1, function2]}
        # Using a list of functions supports multiple aggregations on the same column
        func_map = {}
        # Mapping for pandas aggregation functions
        func_translation = {
            "sum": "sum",
            "avg": "mean",
            "count": "count",
            "min": "min",
            "max": "max",
            "median": "median",
            "std": "std"
        }
        
        for agg in aggregations:
            column = agg.column
            function = agg.function.value
            
            if column not in df.columns:
                continue
                
            p_func = func_translation.get(function, "sum")
            if column not in func_map:
                func_map[column] = []
            if p_func not in func_map[column]:
                func_map[column].append(p_func)
        
        # Group and aggregate
        # Result has a MultiIndex for columns if we used lists in func_map
        grouped = df.groupby(group_by).agg(func_map)
        
        # Flatten the MultiIndex columns and rename to f"{column}_{function}"
        new_columns = []
        # Reverse mapping: mean -> avg
        reverse_translation = {v: k for k, v in func_translation.items()}
        
        for col_name, func_name in grouped.columns:
            display_func = reverse_translation.get(func_name, func_name)
            new_columns.append(f"{col_name}_{display_func}")
            
        grouped.columns = new_columns
        
        # Reset index to pull group_by columns into the dataframe
        # Now name clashes like 'Job Title' vs 'Job Title_count' are avoided
        df_result = grouped.reset_index()
        
        # If we have 2 group_by columns, pivot them for charts (Stacked/Grouped)
        if len(group_by) == 2 and len(aggregations) == 1:
            val_col = new_columns[0] # The only aggregation result
            # Pivot: rows=group_by[0], columns=group_by[1], values=agg_result
            pivot_df = df_result.pivot(index=group_by[0], columns=group_by[1], values=val_col).reset_index()
            # Fill NaN with 0 for charts
            pivot_df = pivot_df.fillna(0)
            return pivot_df

        return df_result
    
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
    def _evaluate_aggregate_measures(df: pd.DataFrame, measures: List[Dict[str, Any]]) -> pd.DataFrame:
        """Evaluate aggregate formulas on the aggregated result"""
        for m in measures:
            name = m["name"]
            formula = m["formula"]
            
            # Map "SUM(Profit)" to "Profit_sum" in the formula
            # Regex to find occurrences and replace
            def replacer(match):
                func, col = match.groups()
                func_lower = func.lower()
                if func_lower == "mean": func_lower = "avg"
                return f"{col}_{func_lower}"
            
            clean_formula = re.sub(r'(\w+)\((\w+)\)', replacer, formula)
            
            try:
                df[name] = df.eval(clean_formula)
            except Exception as e:
                print(f"Error evaluating aggregate measure {name}: {e}")
                
        return df

    @staticmethod
    def preview_data(
        file_path: str,
        limit: int = 100,
        transformations: List[Dict[str, Any]] = None,
        measures: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Preview first N rows of a dataset"""
        df = pd.read_csv(file_path)
        
        if transformations:
            df = TransformationService.apply_transformations(df, transformations)
        
        if measures:
            df = ModelingService.apply_measures(df, measures)
            
        df_preview = df.head(limit).copy()

        # Handle aggregate measures in preview
        if measures:
            agg_measures = [m for m in measures if any(agg in m.get("formula", "").upper() for agg in ["SUM(", "AVG(", "COUNT(", "MIN(", "MAX("])]
            if agg_measures:
                for m in agg_measures:
                    deps = re.findall(r'(\w+)\((\w+)\)', m["formula"])
                    for func, col in deps:
                        if col in df_preview.columns:
                            func_lower = func.lower()
                            if func_lower == "mean": func_lower = "avg"
                            target_col = f"{col}_{func_lower}"
                            if func_lower == "sum": df_preview[target_col] = df_preview[col].sum()
                            elif func_lower == "avg": df_preview[target_col] = df_preview[col].mean()
                            elif func_lower == "count": df_preview[target_col] = df_preview[col].count()
                            elif func_lower == "min": df_preview[target_col] = df_preview[col].min()
                            elif func_lower == "max": df_preview[target_col] = df_preview[col].max()
                
                df_preview = QueryEngine._evaluate_aggregate_measures(df_preview, agg_measures)
        
        return {
            "data": df_preview.to_dict(orient="records"),
            "total_rows": len(df_preview),
            "columns": df_preview.columns.tolist()
        }
