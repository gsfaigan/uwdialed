"""
Flask routes for reviews endpoints
"""
from flask import Blueprint, jsonify, request
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.reviews_backend import add_review, get_all_reviews, get_reviews_by_study_spot

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route("/reviews", methods=["POST"])
def create_review():
    """
    Create a new review for a study spot.
    Expected JSON body:
    {
        "studySpotId": int,
        "name": str,
        "stars": int (1-5),
        "review": str
    }
    """
    try:
        data = request.get_json(silent=True)
        
        if not data:
            return jsonify({"error": "Missing request body"}), 400
        
        # Validate required fields
        required_fields = ["studySpotId", "name", "stars", "review"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Call the backend service
        result = add_review(
            study_spot_id=data["studySpotId"],
            name=data["name"],
            stars=data["stars"],
            review=data["review"]
        )
        
        if result.get("status") == "success":
            return jsonify(result), 201
        else:
            return jsonify(result), 500
            
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error creating review: {str(e)}"}), 500


@reviews_bp.route("/reviews", methods=["GET"])
def get_reviews():
    """
    Get all reviews from the database.
    Optionally filter by studySpotId using query parameter: ?studySpotId=<id>
    """
    try:
        study_spot_id = request.args.get("studySpotId", type=int)
        
        if study_spot_id:
            reviews = get_reviews_by_study_spot(study_spot_id)
        else:
            reviews = get_all_reviews()
        
        return jsonify({"reviews": reviews})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error fetching reviews: {str(e)}"}), 500


@reviews_bp.route("/reviews/<int:study_spot_id>", methods=["GET"])
def get_reviews_for_study_spot(study_spot_id):
    """
    Get all reviews for a specific study spot.
    """
    try:
        reviews = get_reviews_by_study_spot(study_spot_id)
        return jsonify({"reviews": reviews})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error fetching reviews: {str(e)}"}), 500

