# BOC Data Visualization Platform

A comprehensive Business Intelligence (BI) platform for data analysis, visualization, and reporting, similar to Power BI.

## Architecture

- **Backend**: FastAPI with Microsoft SQL Server database
- **Frontend**: React with Vite
- **Data Processing**: Pandas for in-memory analytics
- **Authentication**: JWT-based user management

## Features

- Dataset upload and management (CSV files)
- Data profiling and statistics
- Interactive querying with filters and aggregations
- Multiple chart types (bar, line, pie, scatter, heatmap)
- Dashboard creation and sharing
- PDF and CSV report generation
- Advanced analytics (anomaly detection, forecasting, trend analysis)

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy with pyodbc
- Microsoft SQL Server
- Pandas, NumPy
- Matplotlib, Seaborn
- ReportLab

### Frontend
- React
- Vite
- Chart.js or similar for visualizations

## Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- Microsoft SQL Server (or Docker)
- ODBC Driver 18 for SQL Server

### Database Setup
1. Install Microsoft SQL Server or run with Docker:
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

2. Create database:
```sql
CREATE DATABASE boc_bi_platform;
```

### Backend Setup
1. Navigate to backend directory
2. Install dependencies: `pip install -r requirements.txt`
3. Configure environment variables in `.env`
4. Initialize database: `python init_db.py`
5. Run server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Migration from PostgreSQL

This project has been migrated from PostgreSQL to Microsoft SQL Server:

- UUID fields → UNIQUEIDENTIFIER with NEWID()
- JSONB fields → NVARCHAR(MAX) with JSON serialization
- TIMESTAMP → DATETIME2
- Updated SQLAlchemy models and raw queries for MSSQL compatibility

## License

MIT