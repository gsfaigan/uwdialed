"""
Comprehensive test suite for UWDialed Python backend
Tests all modules including Flask routes, database services, and business logic.
"""
import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock, call
from flask import Flask
import json

# Add backend to path for imports
backend_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'backend')
sys.path.insert(0, backend_path)

# Import modules to test
from app import app
from routes.study_spots import study_spots_bp, score_study_spot, BUSYNESS_MAP, POWER_MAP, LIGHTING_MAP
from routes.reviews import reviews_bp
from services.database import get_db_connection, get_all_study_spots
from services.reviews_backend import add_review, get_all_reviews, get_reviews_by_study_spot


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_study_spots():
    """Sample study spots data for testing."""
    return [
        {
            'id': 1,
            'name': 'Test Spot 1',
            'busyness_estimate': 2,
            'power_options': 'Y',
            'nearby_food_drink_options': 'Cafeteria',
            'noise_level': 'quiet',
            'natural_lighting': 'Well'
        },
        {
            'id': 2,
            'name': 'Test Spot 2',
            'busyness_estimate': 4,
            'power_options': 'Limited',
            'nearby_food_drink_options': 'Vending machines',
            'noise_level': 'moderate',
            'natural_lighting': 'Yes'
        },
        {
            'id': 3,
            'name': 'Test Spot 3',
            'busyness_estimate': 1,
            'power_options': 'N',
            'nearby_food_drink_options': 'None',
            'noise_level': 'very quiet',
            'natural_lighting': 'No'
        }
    ]


@pytest.fixture
def sample_reviews():
    """Sample reviews data for testing."""
    from datetime import datetime
    return [
        {
            'id': 1,
            'studySpotId': 1,
            'name': 'John Doe',
            'stars': 5,
            'review': 'Great spot!',
            'created_at': datetime(2024, 1, 1, 12, 0, 0)
        },
        {
            'id': 2,
            'studySpotId': 1,
            'name': 'Jane Smith',
            'stars': 4,
            'review': 'Nice place to study.',
            'created_at': datetime(2024, 1, 2, 12, 0, 0)
        }
    ]


# ============================================================================
# APPLICATION TESTS (app.py)
# ============================================================================

class TestApplication:
    """Test cases for Flask application initialization and root endpoint."""
    
    def test_root_endpoint(self, client):
        """Test Case 1.1: Root endpoint returns correct message."""
        response = client.get('/')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'UWDialed API is running'
    
    def test_app_initialization(self):
        """Test Case 1.2: Application is properly initialized with CORS and blueprints."""
        assert app is not None
        assert 'study_spots' in [bp.name for bp in app.blueprints.values()]
        assert 'reviews' in [bp.name for bp in app.blueprints.values()]


# ============================================================================
# STUDY SPOTS ROUTES TESTS (routes/study_spots.py)
# ============================================================================

class TestStudySpotsRoutes:
    """Test cases for study spots API endpoints."""
    
    @patch('routes.study_spots.get_all_study_spots')
    def test_get_all_study_spots_success(self, mock_get_spots, client, sample_study_spots):
        """Test Case 2.1: Get all study spots successfully."""
        mock_get_spots.return_value = sample_study_spots
        response = client.get('/study-spots')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'study_spots' in data
        assert len(data['study_spots']) == 3
    
    @patch('routes.study_spots.get_all_study_spots')
    def test_get_all_study_spots_database_error(self, mock_get_spots, client):
        """Test Case 2.2: Handle database error when fetching study spots."""
        mock_get_spots.side_effect = Exception("Database connection failed")
        response = client.get('/study-spots')
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('routes.study_spots.get_all_study_spots')
    def test_get_study_spot_by_id_success(self, mock_get_spots, client, sample_study_spots):
        """Test Case 2.3: Get study spot by valid ID."""
        mock_get_spots.return_value = sample_study_spots
        response = client.get('/study-spots/1')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == 1
        assert data['name'] == 'Test Spot 1'
    
    @patch('routes.study_spots.get_all_study_spots')
    def test_get_study_spot_by_id_not_found(self, mock_get_spots, client, sample_study_spots):
        """Test Case 2.4: Get study spot with non-existent ID."""
        mock_get_spots.return_value = sample_study_spots
        response = client.get('/study-spots/999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error'].lower()
    
    @patch('routes.study_spots.get_all_study_spots')
    def test_recommend_study_spots_success(self, mock_get_spots, client, sample_study_spots):
        """Test Case 2.5: Recommend study spots with valid preferences."""
        mock_get_spots.return_value = sample_study_spots
        preferences = {
            'busyness': 'quiet',
            'powerAccess': 'essential',
            'noiseLevel': 'quiet'
        }
        response = client.post('/study-spots/recommend', 
                             json=preferences,
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recommended_spots' in data
        assert len(data['recommended_spots']) <= 5
        # Check that spots have match scores
        for spot in data['recommended_spots']:
            assert 'match_score' in spot
    
    @patch('routes.study_spots.get_all_study_spots')
    def test_recommend_study_spots_missing_preferences(self, mock_get_spots, client):
        """Test Case 2.6: Recommend study spots without preferences."""
        mock_get_spots.return_value = []
        response = client.post('/study-spots/recommend',
                             json={},
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('routes.study_spots.get_all_study_spots')
    def test_recommend_study_spots_no_spots_available(self, mock_get_spots, client):
        """Test Case 2.7: Recommend when no spots are available."""
        mock_get_spots.return_value = []
        preferences = {'busyness': 'quiet'}
        response = client.post('/study-spots/recommend',
                             json=preferences,
                             content_type='application/json')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data


class TestScoreStudySpot:
    """Test cases for study spot scoring algorithm."""
    
    def test_score_busyness_matching(self):
        """Test Case 2.8: Score calculation for busyness preference."""
        spot = {'busyness_estimate': 2}
        preferences = {'busyness': 'quiet'}  # quiet = 2
        score = score_study_spot(spot, preferences)
        assert score == 3  # max(0, 3 - abs(2-2)) = 3
    
    def test_score_busyness_close_match(self):
        """Test busyness scoring with close match."""
        spot = {'busyness_estimate': 3}
        preferences = {'busyness': 'quiet'}  # quiet = 2
        score = score_study_spot(spot, preferences)
        assert score == 2  # max(0, 3 - abs(3-2)) = 2
    
    def test_score_busyness_far_match(self):
        """Test busyness scoring with far match."""
        spot = {'busyness_estimate': 5}
        preferences = {'busyness': 'quiet'}  # quiet = 2
        score = score_study_spot(spot, preferences)
        assert score == 0  # max(0, 3 - abs(5-2)) = 0
    
    def test_score_busyness_invalid_value(self):
        """Test busyness scoring with invalid spot value."""
        spot = {'busyness_estimate': 'invalid'}
        preferences = {'busyness': 'quiet'}
        score = score_study_spot(spot, preferences)
        assert score == 0
    
    def test_score_power_access_essential_yes(self):
        """Test Case 2.9: Score calculation for power access - essential with Y."""
        spot = {'power_options': 'Y'}
        preferences = {'powerAccess': 'essential'}
        score = score_study_spot(spot, preferences)
        assert score == 2
    
    def test_score_power_access_essential_limited(self):
        """Test power access scoring - essential with Limited."""
        spot = {'power_options': 'Limited'}
        preferences = {'powerAccess': 'essential'}
        score = score_study_spot(spot, preferences)
        assert score == 1
    
    def test_score_power_access_essential_no(self):
        """Test power access scoring - essential with N."""
        spot = {'power_options': 'N'}
        preferences = {'powerAccess': 'essential'}
        score = score_study_spot(spot, preferences)
        assert score == 0
    
    def test_score_power_access_not_important(self):
        """Test power access scoring - not important."""
        spot = {'power_options': 'N'}
        preferences = {'powerAccess': 'not important'}
        score = score_study_spot(spot, preferences)
        assert score == 1
    
    def test_score_food_preference_matching(self):
        """Test Case 2.10: Score calculation for food preference."""
        spot = {'nearby_food_drink_options': 'Cafeteria and vending machines'}
        preferences = {'foodPreference': 'Cafeteria'}
        score = score_study_spot(spot, preferences)
        assert score == 2
    
    def test_score_food_preference_no_match(self):
        """Test food preference scoring with no match."""
        spot = {'nearby_food_drink_options': 'Vending machines'}
        preferences = {'foodPreference': 'Cafeteria'}
        score = score_study_spot(spot, preferences)
        assert score == 0
    
    def test_score_noise_level_matching(self):
        """Test Case 2.11: Score calculation for noise level."""
        spot = {'noise_level': 'quiet study area'}
        preferences = {'noiseLevel': 'quiet'}
        score = score_study_spot(spot, preferences)
        assert score == 2
    
    def test_score_noise_level_no_match(self):
        """Test noise level scoring with no match."""
        spot = {'noise_level': 'loud area'}
        preferences = {'noiseLevel': 'quiet'}
        score = score_study_spot(spot, preferences)
        assert score == 0
    
    def test_score_lighting_matching(self):
        """Test Case 2.12: Score calculation for lighting preference."""
        spot = {'natural_lighting': 'Well lit'}
        preferences = {'lighting': 'bright natural light'}
        score = score_study_spot(spot, preferences)
        assert score == 2
    
    def test_score_lighting_some_light(self):
        """Test lighting scoring with some natural light."""
        spot = {'natural_lighting': 'Yes, some windows'}
        preferences = {'lighting': 'some natural light'}
        score = score_study_spot(spot, preferences)
        assert score == 2
    
    def test_score_lighting_no_match(self):
        """Test lighting scoring with no match."""
        spot = {'natural_lighting': 'No windows'}
        preferences = {'lighting': 'bright natural light'}
        score = score_study_spot(spot, preferences)
        assert score == 0
    
    def test_score_no_preference(self):
        """Test Case 2.13: Score when user has no preference."""
        spot = {
            'busyness_estimate': 2,
            'power_options': 'Y',
            'nearby_food_drink_options': 'Cafeteria'
        }
        preferences = {
            'busyness': 'no preference',
            'powerAccess': 'no preference',
            'foodPreference': 'no preference'
        }
        score = score_study_spot(spot, preferences)
        assert score == 0  # No preference should not affect score
    
    def test_score_multiple_preferences(self):
        """Test scoring with multiple preferences."""
        spot = {
            'busyness_estimate': 2,
            'power_options': 'Y',
            'nearby_food_drink_options': 'Cafeteria',
            'noise_level': 'quiet',
            'natural_lighting': 'Well'
        }
        preferences = {
            'busyness': 'quiet',
            'powerAccess': 'essential',
            'foodPreference': 'Cafeteria',
            'noiseLevel': 'quiet',
            'lighting': 'bright natural light'
        }
        score = score_study_spot(spot, preferences)
        # Should have points from all matching preferences
        assert score > 0
        assert score >= 8  # Multiple matches should give higher score
    
    def test_score_missing_spot_attribute(self):
        """Test scoring when spot is missing an attribute."""
        spot = {'busyness_estimate': 2}  # Missing other attributes
        preferences = {
            'busyness': 'quiet',
            'powerAccess': 'essential'
        }
        score = score_study_spot(spot, preferences)
        # Should only score on available attributes
        assert score == 3  # Only busyness match


# ============================================================================
# REVIEWS ROUTES TESTS (routes/reviews.py)
# ============================================================================

class TestReviewsRoutes:
    """Test cases for reviews API endpoints."""
    
    @patch('routes.reviews.add_review')
    def test_create_review_success(self, mock_add_review, client):
        """Test Case 3.1: Create review with valid data."""
        mock_add_review.return_value = {
            'message': 'Review added successfully',
            'status': 'success'
        }
        review_data = {
            'studySpotId': 1,
            'name': 'John Doe',
            'stars': 5,
            'review': 'Great spot!'
        }
        response = client.post('/reviews',
                             json=review_data,
                             content_type='application/json')
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['status'] == 'success'
        mock_add_review.assert_called_once_with(
            study_spot_id=1,
            name='John Doe',
            stars=5,
            review='Great spot!'
        )
    
    def test_create_review_missing_body(self, client):
        """Test Case 3.2: Create review without request body."""
        response = client.post('/reviews',
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing request body' in data['error']
    
    def test_create_review_missing_required_fields(self, client):
        """Test Case 3.3: Create review with missing required fields."""
        review_data = {
            'studySpotId': 1,
            'name': 'John Doe'
            # Missing stars and review
        }
        response = client.post('/reviews',
                             json=review_data,
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing required field' in data['error']
    
    @patch('routes.reviews.add_review')
    def test_create_review_invalid_stars(self, mock_add_review, client):
        """Test Case 3.4: Create review with invalid stars value."""
        mock_add_review.side_effect = ValueError("Stars must be an integer between 1 and 5.")
        review_data = {
            'studySpotId': 1,
            'name': 'John Doe',
            'stars': 10,  # Invalid
            'review': 'Test review'
        }
        response = client.post('/reviews',
                             json=review_data,
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('routes.reviews.get_all_reviews')
    def test_get_all_reviews_success(self, mock_get_reviews, client, sample_reviews):
        """Test Case 3.5: Get all reviews successfully."""
        # Format timestamps for mock
        formatted_reviews = []
        for review in sample_reviews:
            r = review.copy()
            r['created_at'] = r['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            formatted_reviews.append(r)
        mock_get_reviews.return_value = formatted_reviews
        
        response = client.get('/reviews')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reviews' in data
        assert len(data['reviews']) == 2
    
    @patch('routes.reviews.get_reviews_by_study_spot')
    def test_get_reviews_filtered_by_study_spot_id(self, mock_get_reviews, client, sample_reviews):
        """Test Case 3.6: Get reviews filtered by study spot ID."""
        formatted_reviews = [sample_reviews[0].copy()]
        formatted_reviews[0]['created_at'] = formatted_reviews[0]['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        mock_get_reviews.return_value = formatted_reviews
        
        response = client.get('/reviews?studySpotId=1')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reviews' in data
        assert len(data['reviews']) == 1
        mock_get_reviews.assert_called_once_with(1)
    
    @patch('routes.reviews.get_reviews_by_study_spot')
    def test_get_reviews_for_study_spot_success(self, mock_get_reviews, client, sample_reviews):
        """Test Case 3.7: Get reviews for specific study spot."""
        formatted_reviews = []
        for review in sample_reviews:
            r = review.copy()
            r['created_at'] = r['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            formatted_reviews.append(r)
        mock_get_reviews.return_value = formatted_reviews
        
        response = client.get('/reviews/1')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reviews' in data
        mock_get_reviews.assert_called_once_with(1)
    
    @patch('routes.reviews.get_all_reviews')
    def test_get_reviews_database_error(self, mock_get_reviews, client):
        """Test Case 3.8: Handle database error when fetching reviews."""
        mock_get_reviews.side_effect = Exception("Database error")
        response = client.get('/reviews')
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data


# ============================================================================
# DATABASE SERVICE TESTS (services/database.py)
# ============================================================================

class TestDatabaseService:
    """Test cases for database service functions."""
    
    @patch('services.database.pymysql.connect')
    def test_get_db_connection_success(self, mock_connect):
        """Test Case 4.1: Get database connection successfully."""
        mock_connection = MagicMock()
        mock_connect.return_value = mock_connection
        connection = get_db_connection()
        assert connection is not None
        mock_connect.assert_called_once()
    
    @patch('services.database.pymysql.connect')
    def test_get_db_connection_failure(self, mock_connect):
        """Test Case 4.2: Handle database connection failure."""
        import pymysql
        mock_connect.side_effect = pymysql.Error("Connection failed")
        connection = get_db_connection()
        assert connection is None
    
    @patch('services.database.get_db_connection')
    def test_get_all_study_spots_success(self, mock_get_conn, sample_study_spots):
        """Test Case 4.3: Get all study spots successfully."""
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_cursor.fetchall.return_value = sample_study_spots
        mock_get_conn.return_value = mock_connection
        
        spots = get_all_study_spots()
        assert len(spots) == 3
        assert spots[0]['id'] == 1
    
    @patch('services.database.get_db_connection')
    def test_get_all_study_spots_connection_failure(self, mock_get_conn):
        """Test Case 4.4: Handle connection failure when getting study spots."""
        mock_get_conn.return_value = None
        spots = get_all_study_spots()
        assert spots == []
    
    @patch('services.database.get_db_connection')
    def test_get_all_study_spots_query_error(self, mock_get_conn):
        """Test Case 4.5: Handle query error when getting study spots."""
        import pymysql
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_cursor.execute.side_effect = pymysql.Error("Query failed")
        mock_get_conn.return_value = mock_connection
        
        spots = get_all_study_spots()
        assert spots == []


# ============================================================================
# REVIEWS BACKEND SERVICE TESTS (services/reviews_backend.py)
# ============================================================================

class TestReviewsBackend:
    """Test cases for reviews backend service functions."""
    
    @patch('services.reviews_backend.get_db_connection')
    def test_add_review_success(self, mock_get_conn):
        """Test Case 5.1: Add review successfully."""
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_connection.open = True
        mock_get_conn.return_value = mock_connection
        
        result = add_review(study_spot_id=1, name='John Doe', stars=5, review='Great!')
        assert result['status'] == 'success'
        mock_cursor.execute.assert_called_once()
        mock_connection.commit.assert_called_once()
    
    def test_add_review_invalid_study_spot_id(self):
        """Test Case 5.2: Validate invalid study spot ID."""
        with pytest.raises(ValueError, match="Study spot ID must be a positive integer"):
            add_review(study_spot_id=0, name='John', stars=5, review='Test')
        
        with pytest.raises(ValueError, match="Study spot ID must be a positive integer"):
            add_review(study_spot_id=-1, name='John', stars=5, review='Test')
    
    def test_add_review_empty_name(self):
        """Test Case 5.3: Validate empty name."""
        with pytest.raises(ValueError, match="Name cannot be empty"):
            add_review(study_spot_id=1, name='', stars=5, review='Test')
        
        with pytest.raises(ValueError, match="Name cannot be empty"):
            add_review(study_spot_id=1, name='   ', stars=5, review='Test')
    
    def test_add_review_empty_review_text(self):
        """Test Case 5.4: Validate empty review text."""
        with pytest.raises(ValueError, match="Review text cannot be empty"):
            add_review(study_spot_id=1, name='John', stars=5, review='')
        
        with pytest.raises(ValueError, match="Review text cannot be empty"):
            add_review(study_spot_id=1, name='John', stars=5, review='   ')
    
    def test_add_review_invalid_stars_range(self):
        """Test Case 5.5: Validate stars outside 1-5 range."""
        with pytest.raises(ValueError, match="Stars must be an integer between 1 and 5"):
            add_review(study_spot_id=1, name='John', stars=0, review='Test')
        
        with pytest.raises(ValueError, match="Stars must be an integer between 1 and 5"):
            add_review(study_spot_id=1, name='John', stars=6, review='Test')
    
    @patch('services.reviews_backend.get_db_connection')
    def test_add_review_database_error(self, mock_get_conn):
        """Test Case 5.6: Handle database error when adding review."""
        import pymysql
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_connection.open = True
        mock_cursor.execute.side_effect = pymysql.MySQLError("Database error")
        mock_get_conn.return_value = mock_connection
        
        result = add_review(study_spot_id=1, name='John', stars=5, review='Test')
        assert 'status' not in result or result.get('status') != 'success'
        assert 'error' in result or 'Failed' in result.get('message', '')
        mock_connection.rollback.assert_called_once()
    
    @patch('services.reviews_backend.get_db_connection')
    def test_get_all_reviews_success(self, mock_get_conn, sample_reviews):
        """Test Case 5.7: Get all reviews successfully."""
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_connection.open = True
        mock_cursor.fetchall.return_value = sample_reviews
        mock_get_conn.return_value = mock_connection
        
        reviews = get_all_reviews()
        assert len(reviews) == 2
        # Check that timestamps are formatted as strings
        assert isinstance(reviews[0]['created_at'], str)
    
    @patch('services.reviews_backend.get_db_connection')
    def test_get_all_reviews_database_error(self, mock_get_conn):
        """Test Case 5.8: Handle database error when getting all reviews."""
        import pymysql
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_connection.open = True
        mock_cursor.execute.side_effect = pymysql.MySQLError("Database error")
        mock_get_conn.return_value = mock_connection
        
        reviews = get_all_reviews()
        assert reviews == []
    
    @patch('services.reviews_backend.get_db_connection')
    def test_get_reviews_by_study_spot_success(self, mock_get_conn, sample_reviews):
        """Test Case 5.9: Get reviews for specific study spot successfully."""
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_connection.open = True
        # Filter to only reviews for spot 1
        filtered_reviews = [r for r in sample_reviews if r['studySpotId'] == 1]
        mock_cursor.fetchall.return_value = filtered_reviews
        mock_get_conn.return_value = mock_connection
        
        reviews = get_reviews_by_study_spot(1)
        assert len(reviews) == 2
        assert all(r['studySpotId'] == 1 for r in reviews)
    
    def test_get_reviews_by_study_spot_invalid_id(self):
        """Test Case 5.10: Validate invalid study spot ID."""
        with pytest.raises(ValueError, match="Study spot ID must be a positive integer"):
            get_reviews_by_study_spot(0)
        
        with pytest.raises(ValueError, match="Study spot ID must be a positive integer"):
            get_reviews_by_study_spot(-1)
    
    @patch('services.reviews_backend.get_db_connection')
    def test_get_reviews_by_study_spot_database_error(self, mock_get_conn):
        """Test Case 5.11: Handle database error when getting reviews by study spot."""
        import pymysql
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value.__exit__.return_value = None
        mock_connection.open = True
        mock_cursor.execute.side_effect = pymysql.MySQLError("Database error")
        mock_get_conn.return_value = mock_connection
        
        reviews = get_reviews_by_study_spot(1)
        assert reviews == []


# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--cov=src/backend', '--cov-report=term-missing'])

