# Backend API

This is the Flask backend for UWDialed that connects to the MySQL database using pymysql.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file at the project root (`Project/.env`) with your credentials:
```bash
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
```

> The `.env` file is gitignored so your credentials stay private.

3. Run the server:
```bash
cd backend
python app.py
```

Or simply:
```bash
python backend/app.py
```

The API will be available at `http://localhost:5001`

## Endpoints

- `GET /study-spots` - Get all study spots from the database
- `GET /study-spots/{spot_id}` - Get a specific study spot by ID
- `POST /study-spots/recommend` - Get the best study spot for a survey payload

## Database

The backend connects to MySQL at `riku.shoshin.uwaterloo.ca` using the `SE101_Team_01` database.

The `UWDialedStudyData` table has the following columns:
- `id` - Primary key
- `location` - Study spot location/name
- `longitude` - Longitude coordinate (required for map display)
- `latitude` - Latitude coordinate (required for map display)
- `busyness_estimate` - Estimated busyness level
- `power_options` - Power outlet availability
- `nearby_food_drink_options` - Nearby food and drink options
- `noise_level` - Noise level at the study spot
- `natural_lighting` - Natural lighting availability

