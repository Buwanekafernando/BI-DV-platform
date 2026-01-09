# BI Analytics Platform Backend

A comprehensive BI (Business Intelligence) platform backend built with FastAPI, providing Power BI-like functionality for data analysis, visualization, and reporting.

## Features

- **User Authentication**: JWT-based authentication with user isolation
- **CSV Upload**: Secure dataset upload with validation
- **Data Profiling**: Automatic column detection, type inference, and statistics
- **Query Engine**: Filtering, grouping, and aggregation (SUM, AVG, COUNT, MIN, MAX, MEDIAN, STD)
- **Chart Data**: Visualization-ready data for bar, line, pie, scatter, and heatmap charts
- **Report Generation**: Professional PDF and CSV exports

## Tech Stack

- **Framework**: FastAPI
- **Database**: Microsoft SQL Server (metadata) + Pandas (in-memory processing)
- **Authentication**: JWT with bcrypt
- **Data Processing**: Pandas, NumPy
- **Visualization**: Matplotlib, Seaborn
- **Reports**: ReportLab

## Setup

### Prerequisites

- Python 3.9+
- Microsoft SQL Server (or Docker container)
- ODBC Driver 18 for SQL Server

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```
DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost/boc_bi_platform?driver=ODBC+Driver+18+for+SQL+Server
SECRET_KEY=your_secret_key_here
```

4. Initialize the database:
```bash
python init_db.py
```

### Running the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

Interactive API documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Datasets
- `POST /datasets/upload` - Upload CSV file
- `GET /datasets` - List user's datasets
- `GET /datasets/{id}` - Get dataset metadata
- `GET /datasets/{id}/profile` - Get data profiling results
- `DELETE /datasets/{id}` - Delete dataset

### Query
- `POST /query/{dataset_id}` - Execute query with filters/aggregations
- `POST /query/{dataset_id}/preview` - Preview dataset

### Charts
- `POST /charts/{dataset_id}/bar` - Get bar chart data
- `POST /charts/{dataset_id}/line` - Get line chart data
- `POST /charts/{dataset_id}/pie` - Get pie chart data
- `POST /charts/{dataset_id}/scatter` - Get scatter plot data
- `POST /charts/{dataset_id}/heatmap` - Get correlation heatmap

### Reports
- `POST /reports/{dataset_id}/csv` - Generate CSV export
- `POST /reports/{dataset_id}/pdf` - Generate PDF report
- `GET /reports/download/{filename}` - Download report

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── config.py              # Configuration settings
├── database.py            # Database connection
├── init_db.py            # Database initialization
├── models/
│   ├── db_models.py      # SQLAlchemy models
│   └── schemas.py        # Pydantic schemas
├── routers/
│   ├── auth.py           # Authentication endpoints
│   ├── datasets.py       # Dataset management
│   ├── query.py          # Data querying
│   ├── charts.py         # Chart data
│   └── reports.py        # Report generation
├── services/
│   ├── data_profiler.py  # Data profiling
│   ├── query_engine.py   # Query execution
│   ├── chart_formatter.py # Chart data preparation
│   └── report_generator.py # PDF/CSV generation
└── utils/
    ├── auth.py           # Authentication utilities
    ├── validators.py     # Input validation
    └── dataset_manager.py # Dataset access control
```

## License

MIT
