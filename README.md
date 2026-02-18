## 📊 Business Intelligence & Analytics Platform

- A web-based Business Intelligence (BI) and Analytics Platform that enables users to upload datasets, perform data preparation, create calculated measures, generate interactive visualizations, build dashboards, and export analytical reports.

- The system is designed similar to modern BI tools such as Microsoft Power BI and Tableau, supporting a complete analytics workflow from data ingestion to reporting.

## 🚀 Features

-📂 Dataset Upload (CSV support)

-🔍 Automatic Data Profiling

-🛠 Data Preparation (Create Calculated Columns)

-📐 Data Modeling (Custom Measures)

-📊 Interactive Chart Creation (Bar, Line, etc.)

-📋 Dashboard Builder (Multi-chart layout)

-📤 Export to PNG and PDF

-🗄 Microsoft SQL Server Integration

-⚡ FastAPI Backend with REST APIs

-🎨 React-based Professional UI

## 🏗 Tech Stack
-Frontend

  - React (JavaScript)

  - Axios (API communication)

  - CSS / Custom Styling

  - Charting Library (e.g., Chart.js or Recharts)

- Backend

  - FastAPI (Python)

  - Pandas (Data Processing & Query Engine)

  - SQLAlchemy (ORM)

  - Uvicorn (ASGI Server)

## Database

  - Microsoft SQL Server (MSSQL)

  - Reporting

  - ReportLab (PDF generation)

## 📦 System Architecture

Frontend (React)
⬇ REST API
Backend (FastAPI)
⬇
Data Processing Engine (Pandas)
⬇
Microsoft SQL Server Database

## 💻 Prerequisites

Before running the project, ensure the following are installed:

1. Node.js (v18+ recommended)

Download: https://nodejs.org/

2. Python (v3.9+ recommended)

Download: https://www.python.org/

3. Microsoft SQL Server

Install:

SQL Server

SQL Server Management Studio (SSMS)

## 🔧 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/bi-analytics-platform.git
cd bi-analytics-platform

## ⚙ Backend Setup (FastAPI)
1. Navigate to backend folder
cd backend

2. Create virtual environment
python -m venv venv


Activate virtual environment:

Windows:

venv\Scripts\activate


Mac/Linux:

source venv/bin/activate

3. Install dependencies
pip install -r requirements.txt


If requirements.txt is not available:

pip install fastapi uvicorn pandas sqlalchemy pyodbc reportlab python-multipart

4. Configure Database Connection

Update the database connection string in your configuration file:

DATABASE_URL = "mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server"


Ensure:

Database is created

Tables are migrated

ODBC Driver for SQL Server is installed

5. Run Backend Server
uvicorn main:app --reload


Backend will run at:

http://127.0.0.1:8000


Swagger API Docs:

http://127.0.0.1:8000/docs

## 🌐 Frontend Setup (React)
1. Navigate to frontend folder
cd frontend

2. Install dependencies
npm install

3. Start development server
npm start


Frontend will run at:

http://localhost:3000

▶ How to Use the System

Open the frontend in your browser.

Upload a CSV dataset.

Perform Data Preparation (create calculated columns if needed).

Create Data Modeling measures.

Build charts by selecting dimensions and measures.

Add charts to dashboards.

Export dashboards as PNG or PDF.

## 📁 Project Structure
bi-analytics-platform/
│
├── backend/
│   ├── main.py
│   ├── models/
│   ├── services/
│   ├── routes/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── services/
│   └── package.json
│
└── README.md

## 🛠 Development Notes

Currently runs in localhost development environment.

Designed to be deployable as a full enterprise software system.

Measures and calculated columns are stored as metadata.

Raw datasets remain unchanged.
## License

MIT
