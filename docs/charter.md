# Project Charter: UWDialed

## 1. Project Overview

**Project Title:**  
UWDialed

**Project Purpose:**  
UWDialed is a web-based platform designed to help University of Waterloo students discover optimal study spots across campus based on their preferences. Through an initial survey, users indicate preferences such as noise level, busyness, and proximity to food or outlets. The system then recommends study spots with live predicted data and displays them on an interactive campus map.  

By improving navigation and decision-making around study locations, UWDialed aims to enhance the academic experience—especially for first-year students new to campus.

---

## 2. Project Objectives

- Provide personalized study spot recommendations based on user preferences.  
- Help Waterloo students efficiently find study areas suited to their needs and study habits.  
- Display live or predicted data such as:  
  - Expected busyness  
  - Noise level  
  - Food availability nearby  
  - Access to power outlets  
- Integrate an interactive Mapbox map showing campus study spot locations and amenities.

---

## 3. Project Scope

**In Scope:**
- Approximately 20 study spots across the University of Waterloo campus.  
- 4–5 ranking metrics for each spot (busyness, noise level, food options, power outlets, etc.).  
- Interactive map using the Mapbox API.  
- Recommendation engine using user preferences collected through a survey.  
- MySQL database to store study spot data and live statistics.  
- Web interface allowing users to view, search, and filter study spots.

**Out of Scope (Initial Version):**
- Native mobile application.  
- Real-time sensor-based busyness data (to be simulated).  
- User authentication or login features.

---

## 4. Technical Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | React |
| **Backend** | Python (Flask / FastAPI) |
| **Database** | MySQL |
| **Mapping / Geolocation** | Mapbox API |
| **Hosting / Deployment** | TBD (Render, Vercel, or AWS) |

---

## 5. Roles and Responsibilities

| Team Member | Role | Responsibilities |
|--------------|------|------------------|
| **Charles** | FastAPI & MySQL Developer | Backend infrastructure, database design, CRUD endpoints, and data management. |
| **Gabe** | Backend Developer | API integration, data flow management, and connection between frontend and backend. |
| **Sev** | Frontend Developer (React) | UI development, Mapbox integration, and data visualization. |
| **Amir** | Frontend Developer | Survey interface, styling, and ensuring user experience consistency. |
| **Pouya** | Frontend Developer | Survey interface, styling, and ensuring user experience consistency. |

---

## 6. Deliverables

1. **Functional Web Application**
   - Survey input form for user preferences.  
   - Recommendation page with predicted data.  
   - Interactive map of study spots.  

2. **Backend Infrastructure**
   - API endpoints for fetching and adding study spots.  
   - MySQL schema for study spot data.  

3. **Frontend Interface**
   - Responsive UI accessible across browsers.  

4. **Documentation**
   - README and setup instructions.  
   - API documentation and architecture overview.  

---

## 7. Success Criteria

- Database contains 20+ study spots with full metadata (location, building name, food access, outlets, etc.).  
- Core backend functionality (e.g., `add`, `get`, `update`) fully implemented.  
- Frontend allows preference input and displays filtered recommendations.  
- Interactive map integrated using Mapbox API.  
- Basic documentation and deployment complete.  
- Usability tested successfully by at least 5 Waterloo students.

---

## 8. 5-Week Project Timeline

| Week | Focus Area | Key Tasks & Deliverables | Milestones / Outcomes |
|-------|-------------|--------------------------|------------------------|
| **Week 1 – Planning & Setup** | Initialization | Define requirements, finalize feature list, set up GitHub repo, initialize MySQL, obtain Mapbox API key. | ✅ Architecture finalized and environment configured. |
| **Week 2 – Backend Development** | API & Database | Implement FastAPI backend, design MySQL schema, create CRUD endpoints, populate sample data. | ✅ Backend API connected to database. |
| **Week 3 – Frontend Development (Survey + Map)** | Core UI | Build React interface, implement survey, integrate Mapbox with study spot markers, connect to backend. | ✅ Working frontend and interactive map. |
| **Week 4 – Recommendation Logic & Integration** | Feature Integration | Develop recommendation algorithm, implement filtering/sorting logic, test full user flow. | ✅ Full app workflow functional. |
| **Week 5 – Testing, Optimization & Documentation** | Finalization | Conduct QA testing, polish UI, fix bugs, write README and API docs, deploy demo. | ✅ Final product ready for demo and evaluation. |

---

## 9. Risk Management

| Risk | Likelihood | Mitigation Strategy |
|------|-------------|---------------------|
| Mapbox API rate limits or errors | Medium | Cache map data and implement fallback display. |
| Database connectivity issues | Medium | Use error handling and maintain local backups. |
| Inaccurate “busyness” predictions | High | Use time-based or crowdsourced estimates. |
| Time constraints | Medium | Prioritize core functionality before enhancements. |

---