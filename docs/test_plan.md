# Test Plan for UWDialed Project

## 1. Introduction

### 1.1 Purpose
This test plan outlines the testing strategy for the UWDialed Python backend application. The goal is to ensure comprehensive test coverage (≥70%) of all Python modules, including Flask routes, database services, and business logic.

### 1.2 Scope
This test plan covers:
- Flask application initialization (`app.py`)
- Study spots routes (`routes/study_spots.py`)
- Reviews routes (`routes/reviews.py`)
- Database service (`services/database.py`)
- Reviews backend service (`services/reviews_backend.py`)

### 1.3 Test Objectives
- Verify all API endpoints return correct responses
- Validate input handling and error cases
- Test business logic (scoring algorithm, data validation)
- Ensure database operations are properly handled
- Achieve ≥70% code coverage

## 2. Test Strategy

### 2.1 Testing Approach
- **Unit Testing**: Test individual functions and methods in isolation
- **Integration Testing**: Test API endpoints with mocked database connections
- **Mocking**: Use `unittest.mock` to mock database connections and external dependencies

### 2.2 Test Framework
- **Framework**: `pytest` (Python testing framework)
- **Coverage Tool**: `pytest-cov` for code coverage analysis
- **Mocking**: `unittest.mock` for mocking database connections

### 2.3 Test Environment
- Python 3.8+
- pytest >= 7.0.0
- pytest-cov >= 4.0.0
- All dependencies from `requirements.txt`

## 3. Test Cases

### 3.1 Application Tests (`app.py`)

#### Test Case 1.1: Root Endpoint
- **Description**: Test the root endpoint returns correct message
- **Input**: GET request to `/`
- **Expected Output**: `{"message": "UWDialed API is running"}`
- **Status Code**: 200

#### Test Case 1.2: Application Initialization
- **Description**: Test Flask app is properly configured with CORS
- **Input**: Create app instance
- **Expected Output**: App instance with CORS enabled and blueprints registered

### 3.2 Study Spots Routes Tests (`routes/study_spots.py`)

#### Test Case 2.1: Get All Study Spots
- **Description**: Test GET `/study-spots` endpoint
- **Input**: GET request
- **Expected Output**: JSON with `study_spots` array
- **Status Code**: 200

#### Test Case 2.2: Get All Study Spots - Database Error
- **Description**: Test error handling when database fails
- **Input**: GET request with mocked database error
- **Expected Output**: Error message in JSON
- **Status Code**: 500

#### Test Case 2.3: Get Study Spot by ID - Success
- **Description**: Test GET `/study-spots/<id>` with valid ID
- **Input**: GET request with valid spot ID
- **Expected Output**: Study spot JSON object
- **Status Code**: 200

#### Test Case 2.4: Get Study Spot by ID - Not Found
- **Description**: Test GET `/study-spots/<id>` with invalid ID
- **Input**: GET request with non-existent ID
- **Expected Output**: Error message
- **Status Code**: 404

#### Test Case 2.5: Recommend Study Spots - Success
- **Description**: Test POST `/study-spots/recommend` with valid preferences
- **Input**: POST request with preference JSON
- **Expected Output**: Top 5 recommended spots with match scores
- **Status Code**: 200

#### Test Case 2.6: Recommend Study Spots - Missing Preferences
- **Description**: Test POST `/study-spots/recommend` without preferences
- **Input**: POST request with empty body
- **Expected Output**: Error message
- **Status Code**: 400

#### Test Case 2.7: Recommend Study Spots - No Spots Available
- **Description**: Test POST `/study-spots/recommend` when no spots exist
- **Input**: POST request with empty database
- **Expected Output**: Error message
- **Status Code**: 404

#### Test Case 2.8: Score Study Spot - Busyness Matching
- **Description**: Test scoring algorithm for busyness preference
- **Input**: Spot with busyness value, preference for "quiet"
- **Expected Output**: Correct score calculation

#### Test Case 2.9: Score Study Spot - Power Access Matching
- **Description**: Test scoring algorithm for power preference
- **Input**: Spot with power options, preference for "essential"
- **Expected Output**: Correct score calculation

#### Test Case 2.10: Score Study Spot - Food Preference Matching
- **Description**: Test scoring algorithm for food preference
- **Input**: Spot with food options, preference for specific food type
- **Expected Output**: Correct score calculation

#### Test Case 2.11: Score Study Spot - Noise Level Matching
- **Description**: Test scoring algorithm for noise level preference
- **Input**: Spot with noise level, preference for specific noise level
- **Expected Output**: Correct score calculation

#### Test Case 2.12: Score Study Spot - Lighting Matching
- **Description**: Test scoring algorithm for lighting preference
- **Input**: Spot with lighting info, preference for specific lighting
- **Expected Output**: Correct score calculation

#### Test Case 2.13: Score Study Spot - No Preference
- **Description**: Test scoring when user has no preference
- **Input**: Spot with various attributes, preferences with "no preference"
- **Expected Output**: Score should not be affected by that preference

### 3.3 Reviews Routes Tests (`routes/reviews.py`)

#### Test Case 3.1: Create Review - Success
- **Description**: Test POST `/reviews` with valid data
- **Input**: POST request with valid review JSON
- **Expected Output**: Success message with review data
- **Status Code**: 201

#### Test Case 3.2: Create Review - Missing Body
- **Description**: Test POST `/reviews` without request body
- **Input**: POST request with no JSON body
- **Expected Output**: Error message
- **Status Code**: 400

#### Test Case 3.3: Create Review - Missing Required Fields
- **Description**: Test POST `/reviews` with missing required fields
- **Input**: POST request missing one or more required fields
- **Expected Output**: Error message indicating missing field
- **Status Code**: 400

#### Test Case 3.4: Create Review - Invalid Stars
- **Description**: Test POST `/reviews` with invalid stars value
- **Input**: POST request with stars outside 1-5 range
- **Expected Output**: Error message
- **Status Code**: 400

#### Test Case 3.5: Get All Reviews - Success
- **Description**: Test GET `/reviews` without filter
- **Input**: GET request
- **Expected Output**: JSON with all reviews
- **Status Code**: 200

#### Test Case 3.6: Get Reviews - Filtered by Study Spot ID
- **Description**: Test GET `/reviews?studySpotId=<id>`
- **Input**: GET request with query parameter
- **Expected Output**: JSON with filtered reviews
- **Status Code**: 200

#### Test Case 3.7: Get Reviews for Study Spot - Success
- **Description**: Test GET `/reviews/<study_spot_id>`
- **Input**: GET request with valid study spot ID
- **Expected Output**: JSON with reviews for that spot
- **Status Code**: 200

#### Test Case 3.8: Get Reviews - Database Error
- **Description**: Test error handling when database fails
- **Input**: GET request with mocked database error
- **Expected Output**: Error message
- **Status Code**: 500

### 3.4 Database Service Tests (`services/database.py`)

#### Test Case 4.1: Get Database Connection - Success
- **Description**: Test successful database connection
- **Input**: Valid database credentials
- **Expected Output**: Database connection object

#### Test Case 4.2: Get Database Connection - Failure
- **Description**: Test database connection failure handling
- **Input**: Invalid database credentials
- **Expected Output**: None

#### Test Case 4.3: Get All Study Spots - Success
- **Description**: Test fetching all study spots from database
- **Input**: Valid database connection
- **Expected Output**: List of study spot dictionaries

#### Test Case 4.4: Get All Study Spots - Connection Failure
- **Description**: Test when database connection fails
- **Input**: Failed connection
- **Expected Output**: Empty list

#### Test Case 4.5: Get All Study Spots - Query Error
- **Description**: Test when database query fails
- **Input**: Valid connection but query error
- **Expected Output**: Empty list

### 3.5 Reviews Backend Service Tests (`services/reviews_backend.py`)

#### Test Case 5.1: Add Review - Success
- **Description**: Test adding a valid review
- **Input**: Valid review data (study_spot_id, name, stars, review)
- **Expected Output**: Success status dictionary

#### Test Case 5.2: Add Review - Invalid Study Spot ID
- **Description**: Test validation for invalid study spot ID
- **Input**: Non-positive or non-integer study spot ID
- **Expected Output**: ValueError raised

#### Test Case 5.3: Add Review - Empty Name
- **Description**: Test validation for empty name
- **Input**: Empty or whitespace-only name
- **Expected Output**: ValueError raised

#### Test Case 5.4: Add Review - Empty Review Text
- **Description**: Test validation for empty review text
- **Input**: Empty or whitespace-only review text
- **Expected Output**: ValueError raised

#### Test Case 5.5: Add Review - Invalid Stars Range
- **Description**: Test validation for stars outside 1-5 range
- **Input**: Stars < 1 or > 5
- **Expected Output**: ValueError raised

#### Test Case 5.6: Add Review - Database Error
- **Description**: Test error handling when database insert fails
- **Input**: Valid data but database error
- **Expected Output**: Error status dictionary

#### Test Case 5.7: Get All Reviews - Success
- **Description**: Test fetching all reviews
- **Input**: Valid database connection
- **Expected Output**: List of review dictionaries with formatted timestamps

#### Test Case 5.8: Get All Reviews - Database Error
- **Description**: Test error handling when database query fails
- **Input**: Database error during query
- **Expected Output**: Empty list

#### Test Case 5.9: Get Reviews by Study Spot - Success
- **Description**: Test fetching reviews for specific study spot
- **Input**: Valid study spot ID
- **Expected Output**: List of review dictionaries for that spot

#### Test Case 5.10: Get Reviews by Study Spot - Invalid ID
- **Description**: Test validation for invalid study spot ID
- **Input**: Non-positive or non-integer ID
- **Expected Output**: ValueError raised

#### Test Case 5.11: Get Reviews by Study Spot - Database Error
- **Description**: Test error handling when database query fails
- **Input**: Valid ID but database error
- **Expected Output**: Empty list

## 4. Test Execution

### 4.1 Prerequisites
1. Install test dependencies:
   ```bash
   pip install pytest pytest-cov
   ```

2. Ensure all project dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

### 4.2 Running Tests
Execute tests with coverage:
```bash
pytest tests/test_code.py -v --cov=src/backend --cov-report=term-missing --cov-report=html
```

### 4.3 Coverage Requirements
- Minimum coverage: **70%**
- Target coverage: **80%+**
- Coverage reports will be generated in:
  - Terminal output (with missing lines)
  - HTML report in `htmlcov/` directory

## 5. Test Data

### 5.1 Mock Data
Tests use mocked database connections and return sample data:
- Sample study spots with various attributes
- Sample reviews with different ratings and content
- Edge cases (empty data, invalid data, etc.)

### 5.2 Test Isolation
- Each test is independent
- Database operations are mocked to avoid dependencies
- No actual database connections required for testing

## 6. Risk Assessment

### 6.1 High-Risk Areas
- Database connection handling
- Input validation and sanitization
- Error handling in API endpoints
- Scoring algorithm correctness

### 6.2 Mitigation
- Comprehensive mocking of database operations
- Extensive input validation tests
- Error case coverage for all endpoints
- Multiple test cases for scoring algorithm

## 7. Test Deliverables

1. **Test Code**: `tests/test_code.py` with all test cases
2. **Test Report**: `docs/test_report.md` with execution results and coverage analysis
3. **Coverage Report**: HTML coverage report in `htmlcov/` directory

## 8. Success Criteria

- All test cases pass
- Code coverage ≥ 70%
- All critical paths tested
- Error handling verified
- Documentation complete

