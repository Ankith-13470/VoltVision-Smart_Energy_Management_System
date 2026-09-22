# VoltVision - Smart Energy Management System

## Overview

VoltVision is an AI-powered Smart Energy Management System designed to monitor, analyze, and optimize energy consumption in real time. The platform provides interactive dashboards, energy usage insights, anomaly detection and intelligent recommendations to help users reduce energy waste and improve efficiency.

The project combines machine learning, data analytics, and modern web technologies to create a scalable solution for sustainable energy management.


## Key Features

### Energy Consumption Monitoring
- Track energy usage across different time periods
- Visualize consumption trends through interactive dashboards

### Analytics Dashboard
- Daily, weekly, and monthly energy analysis
- Energy usage summaries and reports
- Data visualization for better decision-making

### Anomaly Detection
- Detect unusual spikes or drops in energy consumption
- Alert users about potential energy wastage or system faults

### Energy Optimization Insights
- Generate recommendations for reducing energy consumption
- Improve operational efficiency through data-driven decisions


## Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- FastAPI

### Database
- PostgreSQL

### Machine Learning & Data Analytics
- Scikit-learn
- Pandas
- NumPy

### Visualization
- Streamlit


## System Architecture

```text
Energy Data Sources
        │
        ▼
 Data Collection Layer
        │
        ▼
 FastAPI Backend
        │
 ┌──────┴──────┐
 ▼             ▼
Database    ML Models
(PostgreSQL) (Anomaly Detection)
 │             │
 └──────┬──────┘
        ▼
 Analytics Engine
        │
        ▼
 React Dashboard / Streamlit Interface
        │
        ▼
 End Users
```

## Project Structure

```text
VoltVision-Smart_Energy_Management_System/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│
├── Energy_Data.csv
├── dashboard.py
├── sems.py
├── README.md
│
└── .gitignore
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/Ankith-13470/VoltVision-Smart_Energy_Management_System.git
cd VoltVision-Smart_Energy_Management_System
```

### Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend

npm install
npm start
```


## Running the Application

### Start Backend

```bash
uvicorn main:app --reload
```

### Start Frontend

```bash
npm start
```

### Run Dashboard

```bash
streamlit run dashboard.py
```


## Future Enhancements

- IoT-based smart meter integration
- Real-time energy monitoring sensors
- Carbon footprint estimation
- Automated alert notification system
- Cloud deployment using AWS


## Sustainability Impact

VoltVision contributes to sustainable energy management by helping users:

- Reduce unnecessary energy consumption
- Detect inefficiencies early
- Support environmental sustainability goals


## License

This project is licensed under the MIT License.
