#!/usr/bin/env python3
"""
Database service for connecting to MySQL using pymysql.
Similar to the todo application pattern, but credentials are read from .env.
"""
import os
from pathlib import Path
from typing import Optional, List, Dict

import pymysql

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:  # pragma: no cover - fallback if dependency missing during linting
    def load_dotenv(*_args, **_kwargs):
        return False

# Load credentials from Project/.env so secrets stay out of source control
PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env")

# Database configuration now pulls username/password from the environment
DB_CONFIG = {
    'host': 'riku.shoshin.uwaterloo.ca',
    'user': os.getenv('DB_USER', ''),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': 'SE101_Team_01',
    'cursorclass': pymysql.cursors.DictCursor
}


def get_db_connection():
    """
    Create and return a database connection using pymysql.
    Returns:
        pymysql.Connection or None if connection fails
    """
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except pymysql.Error as err:
        print(f"Error connecting to database: {err}")
        return None


def get_all_study_spots() -> List[Dict]:
    """
    Fetch all study spots from the database.
    Returns:
        List of dictionaries containing study spot data
    """
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        with conn.cursor() as cursor:
            # Select all columns from the table to match the actual schema
            sql = """
                SELECT *
                FROM UWDialedStudyData
            """
            cursor.execute(sql)
            results = cursor.fetchall()
            return results
    except pymysql.Error as err:
        print(f"Error fetching study spots: {err}")
        return []
    finally:
        conn.close()
