# UWDialed - Project Summary

## Executive Overview

**UWDialed** is a web-based platform designed to help University of Waterloo students discover optimal study spots across campus based on their personal preferences. The application provides personalized recommendations through an intelligent survey system, displays study spots on an interactive campus map, and allows users to browse, filter, and review study locations.

**Project Status:** ✅ Completed  
**Development Timeline:** 5 weeks (5 sprints)  
**Team Size:** 5 members  
**Technology Stack:** React (Frontend), Flask (Backend), MySQL (Database), Mapbox (Mapping)

---

## 1. Project Purpose & Objectives

### Primary Goal
Enhance the academic experience for University of Waterloo students by helping them efficiently find study areas suited to their needs and study habits, especially targeting first-year students new to campus.

### Key Objectives
- Provide personalized study spot recommendations based on user preferences
- Display live/predicted data including busyness, noise level, food availability, and power outlets
- Integrate an interactive Mapbox map showing campus study spot locations
- Enable users to browse, filter, and review study spots

---

## 2. Technical Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React | 18.2.0 |
| **Frontend Routing** | React Router DOM | 6.8.0 |
| **Frontend HTTP Client** | Axios | 1.3.0 |
| **Mapping Library** | Mapbox GL | 2.14.0 |
| **Backend Framework** | Flask | 2.3.0+ |
| **CORS** | Flask-CORS | 4.0.0+ |
| **Database** | MySQL | - |
| **Database Driver** | PyMySQL | 1.1.0+ |
| **Environment Config** | python-dotenv | 1.0.0+ |
| **Testing Framework** | pytest | 8.4.2 |
| **Test Coverage** | pytest-cov | 7.0.0 |

### System Architecture

## 3. Core Features

### 3.1 Personalized Recommendation System
- **Survey-Based Preferences**: Users complete an 8-question survey covering:
  - Location type preference
  - Travel distance willingness
  - Busyness preference
  - Power outlet importance
  - Food/drink proximity needs
  - Noise level preferences
  - Natural lighting preferences
- **Intelligent Scoring Algorithm**: Matches user preferences against study spot attributes using weighted scoring
- **Top 5 Recommendations**: Returns the best matching study spots with match scores

### 3.2 Interactive Dashboard
- **Study Spot Cards**: Visual cards displaying key attributes (busyness, noise, power, food, lighting)
- **Recommended Section**: Highlighted section for personalized recommendations (if survey completed)
- **Advanced Filtering**: Filter by:
  - Busyness level (1-5 scale)
  - Noise level
  - Power outlet availability
  - Food/drink options
  - Natural lighting
- **Sorting Options**: Sort by name, busyness (asc/desc), or noise level (asc/desc)
- **Expandable Detail Modal**: Click any card to view:
  - Full study spot details
  - Location image
  - Interactive Mapbox map with marker
  - Reviews and ratings
  - Review submission form

### 3.3 Interactive Campus Map
- **Mapbox Integration**: Interactive map centered on University of Waterloo campus
- **Study Spot Markers**: All study spots displayed as clickable markers
- **Marker Popups**: Click markers to view spot details and navigate to dashboard
- **Responsive Design**: Works on desktop and mobile devices

### 3.4 Review System
- **User Reviews**: Students can submit reviews for study spots
- **Star Ratings**: 1-5 star rating system
- **Review Display**: All reviews displayed in study spot detail modal
- **Form Validation**: Input validation for name, rating, and review text

### 3.5 Survey System
- **Card-by-Card Interface**: Modern, animated survey interface
- **Progress Tracking**: Shows current question number
- **Cookie-Based Storage**: Preferences saved in browser cookies for persistence
- **Retake Survey**: Option to retake survey with saved preferences view

---

## 4. API Endpoints

### Study Spots Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/study-spots` | Get all study spots from database |
| `GET` | `/study-spots/<id>` | Get specific study spot by ID |
| `POST` | `/study-spots/recommend` | Get top 5 recommended spots based on preferences |

### Reviews Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reviews` | Create a new review for a study spot |
| `GET` | `/reviews` | Get all reviews (optionally filter by `?studySpotId=<id>`) |
| `GET` | `/reviews/<study_spot_id>` | Get all reviews for a specific study spot |

---

## 5. Database Schema

### Main Table: `UWDialedStudyData`

The application uses a MySQL database with the following key table structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `location` | VARCHAR | Study spot name/location |
| `latitude` | DECIMAL | Latitude coordinate (for map) |
| `longitude` | DECIMAL | Longitude coordinate (for map) |
| `busyness_estimate` | INT | Busyness level (1-5 scale) |
| `power_options` | VARCHAR | Power outlet availability (Y/Limited/N) |
| `nearby_food_drink_options` | VARCHAR | Food/drink options description |
| `noise_level` | VARCHAR | Noise level description |
| `natural_lighting` | VARCHAR | Natural lighting availability (Yes/Well/No) |

### Reviews Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `study_spot_id` | INT | Foreign key to study spot |
| `name` | VARCHAR | Reviewer name |
| `stars` | INT | Rating (1-5) |
| `review` | TEXT | Review text |
| `created_at` | TIMESTAMP | Review timestamp |

---

## 6. Recommendation Algorithm

The scoring algorithm matches user preferences against study spot attributes:

### Scoring Rules

1. **Busyness Matching**: 
   - User preference mapped to numeric value (1-5)
   - Score = `max(0, 3 - abs(spot_busyness - desired_busyness))`
   - Closer matches receive higher scores

2. **Power Access Matching**:
   - Weighted scoring based on importance level:
     - "Essential": Y=2, Limited=1, N=0
     - "Helpful but not required": Y=2, Limited=1, N=0
     - "Not important": Y=1, Limited=1, N=1

3. **Food Preference Matching**:
   - Exact match: +2 points
   - No preference: +1 point

4. **Noise Level Matching**:
   - Exact match: +2 points

5. **Lighting Matching**:
   - Mapped preference to database values
   - Exact match: +2 points

### Final Ranking
- All spots scored and sorted by total score (descending)
- Top 5 spots returned as recommendations

---

## 7. Team Structure & Roles

| Team Member | Role | Responsibilities |
|-------------|------|------------------|
| **Charles** | FastAPI & MySQL Developer | Backend infrastructure, database design, CRUD endpoints, data management |
| **Gabe** | Backend Developer | API integration, data flow management, connection between frontend and backend |
| **Sev** | Frontend Developer (React) | UI development, Mapbox integration, data visualization |
| **Amir** | Frontend Developer | Survey interface, styling, user experience consistency |
| **Pouya** | Frontend Developer | Survey interface, styling, user experience consistency |

---

## 8. Development Process

### Sprint Overview

The project was developed over 5 sprints following Agile/Scrum methodology:

#### Sprint 1: Planning & Setup (Week 1)
- **Focus**: Initialization and foundation
- **Deliverables**: 
  - Requirements definition
  - Domain model design
  - React and Flask setup
  - Database schema design
  - User stories and use cases
- **Velocity**: 15 story points (100% completion)
- **Status**: ✅ All goals achieved

#### Sprint 2: Backend Development (Week 2)
- **Focus**: API & Database integration
- **Deliverables**:
  - Mapbox API integration
  - Database geolocation data migration
  - Homepage structure
  - 25 study spots with coordinates
- **Velocity**: 15 story points (100% completion)
- **Status**: ✅ All goals achieved

#### Sprint 3: Feature Integration (Week 3)
- **Focus**: Recommendation logic and UI improvements
- **Deliverables**:
  - AI Survey Spot Recommender
  - Home button navigation
  - Study spot images added
- **Velocity**: 9 story points (60% completion)
- **Status**: ⚠️ Dashboard and README docs carried over

#### Sprint 4: UI Enhancements (Week 4)
- **Focus**: Frontend polish and documentation
- **Deliverables**:
  - Expandable study spot modal
  - Card-by-card survey UI
  - Review system integration
  - Footer component
  - Improved navigation
- **Velocity**: 18 story points (100% completion)
- **Status**: ✅ All goals achieved

#### Sprint 5: Testing & Finalization (Week 5)
- **Focus**: Testing, documentation, and deployment prep
- **Deliverables**:
  - Comprehensive test suite (51 tests)
  - 94% code coverage
  - Final documentation
  - UI refinements
- **Status**: ✅ Completed

---

## 9. Testing & Quality Assurance

### Test Coverage

- **Total Test Cases**: 51
- **Tests Passed**: 51 (100%)
- **Code Coverage**: 94% (exceeds 70% requirement)
- **Test Framework**: pytest 8.4.2
- **Coverage Tool**: pytest-cov 7.0.0

### Test Categories

1. **Application Tests** (`app.py`): 94% coverage
   - Root endpoint testing
   - Application initialization
   - CORS configuration

2. **Study Spots Routes** (`routes/study_spots.py`): 94% coverage
   - GET all study spots
   - GET study spot by ID
   - POST recommendation endpoint
   - Scoring algorithm (17 test cases)
   - Error handling

3. **Reviews Routes** (`routes/reviews.py`): 82% coverage
   - Create review
   - Get all reviews
   - Get reviews by study spot
   - Input validation
   - Error handling

4. **Database Service** (`services/database.py`): 100% coverage
   - Connection handling
   - Query execution
   - Error handling

5. **Reviews Backend Service** (`services/reviews_backend.py`): 100% coverage
   - Review creation
   - Data validation
   - Database operations

### Test Execution

All tests are automated and can be executed with:
pytest tests/test_code.py -v --cov=src/backend --cov-report=term-missing---

## 10. Key Achievements

✅ **Functional Web Application**: Fully working React frontend with Flask backend  
✅ **20+ Study Spots**: Database populated with comprehensive study spot data  
✅ **Interactive Map**: Mapbox integration with accurate geolocation  
✅ **Personalized Recommendations**: Intelligent scoring algorithm matching user preferences  
✅ **Review System**: Complete review and rating functionality  
✅ **High Test Coverage**: 94% code coverage (exceeds 70% requirement)  
✅ **Comprehensive Documentation**: User manual, API docs, test plans, and reports  
✅ **Responsive Design**: Works across desktop and mobile devices  
✅ **Modern UI/UX**: Clean, intuitive interface with animations and smooth interactions  

---

## 11. Technical Highlights

### Frontend Features
- **React Router**: Multi-page application with clean navigation
- **State Management**: React hooks for component state
- **API Integration**: Axios for HTTP requests
- **Mapbox GL**: Interactive 3D maps with custom markers
- **Cookie Storage**: Persistent user preferences
- **Responsive CSS**: Modern styling with animations
- **Image Assets**: 25+ study spot images

### Backend Features
- **Flask Blueprints**: Modular route organization
- **CORS Enabled**: Cross-origin resource sharing for frontend
- **Error Handling**: Comprehensive error handling and validation
- **Environment Variables**: Secure credential management
- **Database Connection Pooling**: Efficient database operations
- **RESTful API**: Clean, REST-compliant endpoints

### Recommendation Engine
- **Weighted Scoring**: Multi-factor matching algorithm
- **Preference Mapping**: Flexible preference-to-attribute mapping
- **Top-N Selection**: Returns best matching spots
- **Match Score Display**: Transparency in recommendation reasons

---

## 12. Project Deliverables

### Code Deliverables
- ✅ Complete React frontend application
- ✅ Complete Flask backend API
- ✅ Database schema and migration scripts
- ✅ Comprehensive test suite (51 tests)
- ✅ Test coverage reports

### Documentation Deliverables
- ✅ Project Charter
- ✅ Requirements Document
- ✅ Domain Model
- ✅ User Stories
- ✅ Use Cases
- ✅ Test Plan
- ✅ Test Report
- ✅ User Manual
- ✅ Sprint Retrospectives
- ✅ README with setup instructions

### Infrastructure
- ✅ MySQL database with 20+ study spots
- ✅ Database connection configuration
- ✅ Environment variable setup
- ✅ Mapbox API integration

---

## 13. Known Limitations & Future Enhancements

### Current Limitations
- No user authentication system (anonymous users)
- No real-time sensor data (busyness is estimated/predicted)
- No native mobile application (web-only)
- No favorite/bookmark persistence (session-based)
- Limited to ~20-25 study spots

### Future Enhancement Opportunities
- User accounts and authentication
- Real-time busyness tracking via sensors or crowd-sourced data
- Native mobile apps (iOS/Android)
- Advanced filtering (by building, time of day, etc.)
- Social features (friends, study groups)
- Historical data and analytics
- Integration with university systems
- Favorite spots persistence
- Study spot capacity tracking
- Wait time predictions

---

## 14. Setup & Deployment

### Local Development Setup

**Backend:**
1. Install Python 3.8+
2. Create virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Configure `.env` with database credentials
5. Run: `python app.py` (starts on port 5001)

**Frontend:**
1. Install Node.js 16+
2. Install dependencies: `npm install`
3. Configure `.env` with Mapbox token
4. Run: `npm start` (starts on port 3000)

### Production Deployment
- Backend can be deployed on platforms like Render, Heroku, or AWS
- Frontend can be deployed on Vercel, Netlify, or similar
- Database hosted on `riku.shoshin.uwaterloo.ca`

---

## 15. Project Statistics

- **Total Development Time**: 5 weeks
- **Total Sprints**: 5
- **Team Members**: 5
- **Study Spots**: 20+ locations
- **API Endpoints**: 6 endpoints
- **Test Cases**: 51 tests
- **Code Coverage**: 94%
- **Documentation Files**: 10+ documents
- **Frontend Components**: 5+ main components
- **Backend Modules**: 2 route modules, 2 service modules

---

## 16. Success Metrics

✅ **Functional Requirements**: All core features implemented and working  
✅ **Code Quality**: 94% test coverage (exceeds 70% requirement)  
✅ **Documentation**: Comprehensive documentation suite completed  
✅ **User Experience**: Intuitive interface with smooth interactions  
✅ **Team Collaboration**: Effective Scrum process with clear sprint retrospectives  
✅ **Timeline**: Project completed within 5-week timeline  

---

## Conclusion

UWDialed successfully delivers a functional, well-tested web application that helps University of Waterloo students discover optimal study spots. The project demonstrates strong software engineering practices, including comprehensive testing, clear documentation, and modern web development techniques. The application provides real value to students by matching their preferences with available study locations, making campus navigation more efficient and personalized.

The project was completed successfully with all major deliverables achieved, high code quality standards met, and a positive team collaboration experience throughout the development process.

---

**Project Completion Date**: 2024  
**Final Status**: ✅ Complete and Functional  
**Team**: SE101 Team 01