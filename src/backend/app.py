"""
Flask application entry point
"""
from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes.study_spots import study_spots_bp
from routes.reviews import reviews_bp

# Load environment variables from backend/.env if present
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register blueprints
app.register_blueprint(study_spots_bp)
app.register_blueprint(reviews_bp)

@app.route("/")
def root():
    return jsonify({"message": "UWDialed API is running"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
