import pymysql
from typing import List, Dict, Any
# Import the connection helper from your existing database.py
from services.database import get_db_connection

# --- 1. Insert Function (Saver) ---
def add_review(study_spot_id: int, name: str, stars: int, review: str) -> Dict[str, Any]:
    """
    Validates input and saves a new review to the database.
    """
    # Input Validation
    if not isinstance(study_spot_id, int) or study_spot_id <= 0:
        raise ValueError("Study spot ID must be a positive integer.")
    if not name or not name.strip():
        raise ValueError("Name cannot be empty.")
    if not review or not review.strip():
        raise ValueError("Review text cannot be empty.")
    if not isinstance(stars, int) or not (1 <= stars <= 5):
        raise ValueError("Stars must be an integer between 1 and 5.")

    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Parameterized Query to prevent SQL Injection
            sql = "INSERT INTO reviews (studySpotId, name, stars, review) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (study_spot_id, name, stars, review))
        
        connection.commit()
        return {"message": "Review added successfully", "status": "success"}
        
    except pymysql.MySQLError as e:
        if 'connection' in locals() and connection.open:
            connection.rollback() # Undo changes if error occurs
        print(f"Database error: {e}")
        return {"message": "Failed to save review", "error": str(e)}
        
    finally:
        # Ensure connection closes even if an error happens
        if 'connection' in locals() and connection.open:
            connection.close()

# --- 2. Fetch Function (Getter) ---
def get_all_reviews() -> List[Dict[str, Any]]:
    """
    Retrieves all reviews ordered by newest first.
    """
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT id, studySpotId, name, stars, review, created_at FROM reviews ORDER BY created_at DESC"
            cursor.execute(sql)
            result = cursor.fetchall()
            
            # Helper to format timestamps to string (JSON compatible)
            for row in result:
                if row['created_at']:
                    row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            return result
            
    except pymysql.MySQLError as e:
        print(f"Database error: {e}")
        return []
        
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# --- 3. Get Reviews for Specific Study Spot ---
def get_reviews_by_study_spot(study_spot_id: int) -> List[Dict[str, Any]]:
    """
    Retrieves all reviews for a specific study spot ordered by newest first.
    """
    if not isinstance(study_spot_id, int) or study_spot_id <= 0:
        raise ValueError("Study spot ID must be a positive integer.")
    
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT id, studySpotId, name, stars, review, created_at FROM reviews WHERE studySpotId = %s ORDER BY created_at DESC"
            cursor.execute(sql, (study_spot_id,))
            result = cursor.fetchall()
            
            # Helper to format timestamps to string (JSON compatible)
            for row in result:
                if row['created_at']:
                    row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            return result
            
    except pymysql.MySQLError as e:
        print(f"Database error: {e}")
        return []
        
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()