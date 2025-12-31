from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ============= User Schemas =============
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# ============= Dataset Schemas =============
class DatasetUploadResponse(BaseModel):
    dataset_id: str
    filename: str
    file_size: int
    message: str

class DatasetMetadata(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size: int
    row_count: Optional[int]
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

class ColumnProfile(BaseModel):
    name: str
    dtype: str
    missing_count: int
    missing_percentage: float
    unique_count: int
    sample_values: List[Any]

class NumericColumnProfile(ColumnProfile):
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    q25: Optional[float] = None
    q75: Optional[float] = None

class DataProfileResponse(BaseModel):
    dataset_id: str
    total_rows: int
    total_columns: int
    columns: List[Dict[str, Any]]
    numeric_columns: List[str]
    categorical_columns: List[str]
    date_columns: List[str]

# ============= Query Schemas =============
class AggregationType(str, Enum):
    SUM = "sum"
    AVG = "avg"
    COUNT = "count"
    MIN = "min"
    MAX = "max"
    MEDIAN = "median"
    STD = "std"

class FilterCondition(BaseModel):
    column: str
    operator: str  # eq, ne, gt, lt, gte, lte, in, between
    value: Any

class AggregationRequest(BaseModel):
    column: str
    function: AggregationType

class QueryRequest(BaseModel):
    filters: Optional[List[FilterCondition]] = []
    group_by: Optional[List[str]] = []
    aggregations: Optional[List[AggregationRequest]] = []
    limit: Optional[int] = 1000

class QueryResponse(BaseModel):
    data: List[Dict[str, Any]]
    total_rows: int
    columns: List[str]

# ============= Chart Schemas =============
class ChartType(str, Enum):
    BAR = "bar"
    LINE = "line"
    PIE = "pie"
    SCATTER = "scatter"
    HEATMAP = "heatmap"

class ChartRequest(BaseModel):
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    category_column: Optional[str] = None
    value_column: Optional[str] = None
    aggregation: Optional[AggregationType] = AggregationType.SUM
    filters: Optional[List[FilterCondition]] = []
    limit: Optional[int] = 20

class ChartDataset(BaseModel):
    label: str
    data: List[Any]
    backgroundColor: Optional[List[str]] = None
    borderColor: Optional[str] = None

class ChartResponse(BaseModel):
    chart_type: str
    labels: List[str]
    datasets: List[ChartDataset]
    options: Optional[Dict[str, Any]] = {}

# ============= Report Schemas =============
class ReportFormat(str, Enum):
    CSV = "csv"
    PDF = "pdf"

class ReportRequest(BaseModel):
    title: str
    format: ReportFormat
    include_charts: Optional[bool] = False
    chart_configs: Optional[List[ChartRequest]] = []
    filters: Optional[List[FilterCondition]] = []

class ReportResponse(BaseModel):
    report_id: str
    title: str
    file_path: str
    download_url: str
    created_at: datetime
