Markdown
1
# 🚚 Smart Logistics Weather Intelligence System
2
 
3
Smart Logistics Weather Intelligence System is a full-stack logistics analytics platform built using **Next.js** and **FastAPI**. The application combines real-time weather intelligence, route optimization, predictive analytics, carbon emission tracking, sustainability monitoring, and risk assessment into a unified dashboard for smarter logistics operations.
4
 
5
The platform enables logistics teams to make data-driven decisions by integrating weather forecasts, transportation analytics, route intelligence, and operational insights. Through interactive visualizations and real-time updates, the system helps improve delivery efficiency, reduce environmental impact, and optimize transportation planning.
6
 
7
---
8
 
9
## 🎯 Project Overview
10
 
11
Smart Logistics Weather Intelligence System integrates multiple logistics and weather-based intelligence services into a single platform:
12
 
13
- Monitor real-time weather conditions impacting transportation routes.
14
- Optimize route planning using weather and operational data.
15
- Analyze carbon emissions and sustainability metrics.
16
- Assess route risks and disruptions proactively.
17
- Generate predictive insights for logistics planning.
18
- Deliver intelligent recommendations for operational improvements.
19
- Enable real-time logistics monitoring through WebSockets.
20
- Visualize key KPIs using interactive dashboards.
21
 
22
---
23
 
24
## ✨ Features
25
 
26
### 🌦️ Weather Intelligence
27
Real-time weather forecasting and weather-aware logistics planning.
28
 
29
### 🚚 Route Optimization
30
Intelligent route planning based on weather and transportation conditions.
31
 
32
### 📊 Logistics Analytics Dashboard
33
Interactive dashboards for operational monitoring and analytics.
34
 
35
### 🌱 Carbon Emission Tracking
36
Monitor environmental impact and sustainability performance.
37
 
38
### ⚠️ Route Risk Assessment
39
Identify and evaluate route-related risks and disruptions.
40
 
41
### 🧠 Predictive Analytics
42
Forecast trends and support logistics planning decisions.
43
 
44
### 💡 Smart Recommendations
45
Generate operational recommendations for improved efficiency.
46
 
47
### 📡 Real-Time Monitoring
48
Live updates through FastAPI WebSocket integration.
49
 
50
### 💾 Data Management
51
Store and manage logistics data using SQLite.
52
 
53
### ⚡ Full-Stack Architecture
54
Modern Next.js frontend integrated with FastAPI backend services.
55
 
56
---
57
 
58
## 🛠️ Technology Stack
59
 
60
- Frontend: Next.js, React
61
- Backend: FastAPI
62
- Database: SQLite
63
- Real-Time Communication: WebSockets
64
- Python
65
- JavaScript
66
- Weather APIs
67
- Route Intelligence Services
68
 
69
---
70
 
71
## ⚙️ Setup & Run
72
 
73
### Fix Python SSL Certificate Verification Issue
74
 
75
```bash
76
python -m pip install --upgrade certifi truststore python-certifi-win32
77
```
78
 
79
### Navigate to Backend or Frontend Folder
80
 
81
```bash
82
cd backend
83
```
84
 
85
or
86
 
87
```bash
88
cd frontend
89
```
90
 
91
### Create Virtual Environment
92
 
93
```bash
94
python -m venv .venv
95
```
96
 
97
### Activate Virtual Environment
98
 
99
```bash
100
.\.venv\Scripts\activate
101
```
102
 
103
### Run Backend Server
104
 
105
```bash
106
uvicorn app.main:app --reload --port 8011
107
```
108
 
109
### Run Frontend
110
 
111
Open a new terminal and navigate to the frontend directory:
112
 
113
```bash
114
npm run dev -- --webpack
115
```
