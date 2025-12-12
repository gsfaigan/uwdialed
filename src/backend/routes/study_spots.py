"""
Flask routes for study spots endpoints
"""
from flask import Blueprint, jsonify, request
import sys
import os
import random

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.database import get_all_study_spots

BUSYNESS_MAP = {
    "very quiet": 1,
    "quiet": 2,
    "moderate": 3,
    "busy/active": 4,
    "loud": 5,
}

POWER_MAP = {
    "essential": {"Y": 2, "Limited": 1, "N": 0},
    "helpful but not required": {"Y": 2, "Limited": 1, "N": 0},
    "not important": {"Y": 1, "Limited": 1, "N": 1},
}

LIGHTING_MAP = {
    "bright natural light": "Well",
    "some natural light": "Yes",
    "low/no natural light": "No",
}

# Maps survey preference keys to columns that exist in UWDialedStudyData.
# Only attributes represented in the database are included here.
PREFERENCE_COLUMN_MAP = {
    "busyness": "busyness_estimate",
    "powerAccess": "power_options",
    "foodPreference": "nearby_food_drink_options",
    "noiseLevel": "noise_level",
    "lighting": "natural_lighting",
}


def score_study_spot(spot, preferences):
    """
    Return a numeric score that represents how well `spot` matches `preferences`.
    """
    score = 0

    for pref_key, column_key in PREFERENCE_COLUMN_MAP.items():
        pref_value = preferences.get(pref_key)
        if not pref_value or pref_value.lower() == "no preference":
            continue

        spot_value = spot.get(column_key)
        if not spot_value:
            continue

        # Normalize strings for comparison
        if column_key == "busyness_estimate":
            desired = BUSYNESS_MAP.get(pref_value.lower())
            try:
                spot_busyness = int(spot_value)
            except (TypeError, ValueError):
                spot_busyness = None
            if desired is not None and spot_busyness is not None:
                score += max(0, 3 - abs(spot_busyness - desired))
            continue

        if column_key == "power_options":
            power_scores = POWER_MAP.get(pref_value.lower())
            if power_scores:
                score += power_scores.get(spot_value, 0)
            continue

        if column_key == "nearby_food_drink_options":
            if pref_value.lower() in spot_value.lower():
                score += 2
            elif pref_value.lower() == "no preference":
                score += 1
            continue

        if column_key == "noise_level":
            if pref_value.lower() in spot_value.lower():
                score += 2
            continue

        if column_key == "natural_lighting":
            mapped_pref = LIGHTING_MAP.get(pref_value.lower())
            if mapped_pref and mapped_pref.lower() in spot_value.lower():
                score += 2
            continue

    return score

study_spots_bp = Blueprint('study_spots', __name__)


@study_spots_bp.route("/study-spots", methods=["GET"])
def get_study_spots():
    """
    Get all study spots from the database.
    Returns a list of study spots with their locations and details.
    """
    try:
        study_spots = get_all_study_spots()
        return jsonify({"study_spots": study_spots})
    except Exception as e:
        return jsonify({"error": f"Error fetching study spots: {str(e)}"}), 500


@study_spots_bp.route("/study-spots/<int:spot_id>", methods=["GET"])
def get_study_spot_by_id(spot_id):
    """
    Get a specific study spot by ID.
    """
    try:
        all_spots = get_all_study_spots()
        spot = next((s for s in all_spots if s.get('id') == spot_id), None)
        if not spot:
            return jsonify({"error": "Study spot not found"}), 404
        return jsonify(spot)
    except Exception as e:
        return jsonify({"error": f"Error fetching study spot: {str(e)}"}), 500


@study_spots_bp.route("/study-spots/recommend", methods=["POST"])
def recommend_study_spot():
    """
    Given survey preferences in the request body, return the top 5 matching study spots.
    """
    preferences = request.get_json(silent=True) or {}

    if not preferences:
        return jsonify({"error": "Missing survey preferences in request body."}), 400

    try:
        spots = get_all_study_spots()
        if not spots:
            return jsonify({"error": "No study spots available to recommend."}), 404

        # Score all spots based on preferences
        scored_spots = [
            {**spot, "_match_score": score_study_spot(spot, preferences)}
            for spot in spots
        ]

        # Sort by match score (descending)
        scored_spots.sort(key=lambda s: s["_match_score"], reverse=True)

        # Get top 5 spots (or fewer if there aren't 5 available)
        top_spots = scored_spots[:5]

        # Remove internal _match_score before returning
        recommendations = [
            {**{k: v for k, v in spot.items() if k != "_match_score"}, "match_score": spot["_match_score"]}
            for spot in top_spots
        ]

        return jsonify({"recommended_spots": recommendations})
    except Exception as e:
        return jsonify({"error": f"Error generating recommendation: {str(e)}"}), 500
