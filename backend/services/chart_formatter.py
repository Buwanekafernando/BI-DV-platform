import pandas as pd
import numpy as np
from typing import Dict, List, Any
from models.schemas import ChartRequest, ChartDataset, ChartResponse, AggregationType
from utils.validators import apply_filters

class ChartFormatter:
    """Service for preparing chart-ready data"""
    
    # Color palettes for charts
    COLORS = [
        "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f",
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"
    ]
    
    @staticmethod
    def prepare_bar_chart(file_path: str, request: ChartRequest) -> ChartResponse:
        """Prepare data for bar chart"""
        df = pd.read_csv(file_path)
        
        # Apply filters
        if request.filters:
            df = apply_filters(df, request.filters)
        
        # Group and aggregate
        if request.category_column and request.value_column:
            grouped = df.groupby(request.category_column)[request.value_column].agg(
                request.aggregation.value if request.aggregation else "sum"
            ).reset_index()
            
            # Apply limit
            if request.limit:
                grouped = grouped.head(request.limit)
            
            labels = grouped[request.category_column].astype(str).tolist()
            data = grouped[request.value_column].tolist()
        else:
            # Default: count by first column
            first_col = df.columns[0]
            value_counts = df[first_col].value_counts().head(request.limit or 20)
            labels = value_counts.index.astype(str).tolist()
            data = value_counts.values.tolist()
        
        dataset = ChartDataset(
            label=request.value_column or "Count",
            data=data,
            backgroundColor=ChartFormatter.COLORS[:len(data)]
        )
        
        return ChartResponse(
            chart_type="bar",
            labels=labels,
            datasets=[dataset]
        )
    
    @staticmethod
    def prepare_line_chart(file_path: str, request: ChartRequest) -> ChartResponse:
        """Prepare data for line chart"""
        df = pd.read_csv(file_path)
        
        # Apply filters
        if request.filters:
            df = apply_filters(df, request.filters)
        
        if request.x_column and request.y_column:
            # Sort by x column
            df = df.sort_values(by=request.x_column)
            
            # Apply limit
            if request.limit:
                df = df.head(request.limit)
            
            labels = df[request.x_column].astype(str).tolist()
            data = df[request.y_column].tolist()
        else:
            # Default: use first two columns
            labels = df.iloc[:, 0].astype(str).tolist()[:request.limit or 50]
            data = df.iloc[:, 1].tolist()[:request.limit or 50]
        
        dataset = ChartDataset(
            label=request.y_column or "Value",
            data=data,
            borderColor=ChartFormatter.COLORS[0]
        )
        
        return ChartResponse(
            chart_type="line",
            labels=labels,
            datasets=[dataset]
        )
    
    @staticmethod
    def prepare_pie_chart(file_path: str, request: ChartRequest) -> ChartResponse:
        """Prepare data for pie chart"""
        df = pd.read_csv(file_path)
        
        # Apply filters
        if request.filters:
            df = apply_filters(df, request.filters)
        
        if request.category_column and request.value_column:
            grouped = df.groupby(request.category_column)[request.value_column].sum().reset_index()
            grouped = grouped.head(request.limit or 10)
            
            labels = grouped[request.category_column].astype(str).tolist()
            data = grouped[request.value_column].tolist()
        else:
            # Default: count by first column
            first_col = df.columns[0]
            value_counts = df[first_col].value_counts().head(request.limit or 10)
            labels = value_counts.index.astype(str).tolist()
            data = value_counts.values.tolist()
        
        dataset = ChartDataset(
            label="Distribution",
            data=data,
            backgroundColor=ChartFormatter.COLORS[:len(data)]
        )
        
        return ChartResponse(
            chart_type="pie",
            labels=labels,
            datasets=[dataset]
        )
    
    @staticmethod
    def prepare_scatter_chart(file_path: str, request: ChartRequest) -> ChartResponse:
        """Prepare data for scatter plot"""
        df = pd.read_csv(file_path)
        
        # Apply filters
        if request.filters:
            df = apply_filters(df, request.filters)
        
        if request.x_column and request.y_column:
            # Apply limit
            if request.limit:
                df = df.head(request.limit)
            
            data = [
                {"x": float(x), "y": float(y)}
                for x, y in zip(df[request.x_column], df[request.y_column])
                if pd.notna(x) and pd.notna(y)
            ]
        else:
            # Default: use first two numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns[:2]
            if len(numeric_cols) >= 2:
                data = [
                    {"x": float(x), "y": float(y)}
                    for x, y in zip(df[numeric_cols[0]], df[numeric_cols[1]])
                    if pd.notna(x) and pd.notna(y)
                ][:request.limit or 100]
            else:
                data = []
        
        dataset = ChartDataset(
            label="Data Points",
            data=data,
            backgroundColor=[ChartFormatter.COLORS[0]]
        )
        
        return ChartResponse(
            chart_type="scatter",
            labels=[],
            datasets=[dataset]
        )
    
    @staticmethod
    def prepare_heatmap(file_path: str, request: ChartRequest) -> ChartResponse:
        """Prepare correlation heatmap data"""
        df = pd.read_csv(file_path)
        
        # Apply filters
        if request.filters:
            df = apply_filters(df, request.filters)
        
        # Get numeric columns only
        numeric_df = df.select_dtypes(include=[np.number])
        
        # Calculate correlation matrix
        corr_matrix = numeric_df.corr()
        
        # Convert to format suitable for heatmap
        labels = corr_matrix.columns.tolist()
        data = corr_matrix.values.tolist()
        
        return ChartResponse(
            chart_type="heatmap",
            labels=labels,
            datasets=[ChartDataset(label="Correlation", data=data)],
            options={"min": -1, "max": 1}
        )
