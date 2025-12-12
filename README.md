## UWDialed - Setup Instructions

This guide will help you set up and run the UWDialed application from scratch. UWDialed is a web application that helps University of Waterloo students discover optimal study spots on campus.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+ and npm** - [Download Node.js](https://nodejs.org/)
- **MySQL Client** (optional, for direct database access)

### Step 1: Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd src/backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   
   Create a `.env` file in the `src/backend/` directory:
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file and add your database credentials:
   ```env
   DB_HOST=riku.shoshin.uwaterloo.ca
   DB_NAME=SE101_Team_01
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   ```
   
   > **Note:** The `.env` file is gitignored to keep your credentials secure. Contact your team lead or instructor for database access credentials.

5. **Start the backend server:**
   ```bash
   python app.py
   ```
   
   The backend API will be running at `http://localhost:5001`. You should see a message confirming the server is running.

### Step 2: Frontend Setup

1. **Open a new terminal window** and navigate to the frontend directory:
   ```bash
   cd src/frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `src/frontend/` directory:
   ```env
   REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
   ```
   
   > **Note:** 
   > - `REACT_APP_MAPBOX_TOKEN` is required for the map functionality. Get a free token at [Mapbox](https://www.mapbox.com/). Sign up and create an access token in your account dashboard.

4. **Start the frontend development server:**
   ```bash
   npm start
   ```
   
   The application will automatically open in your browser at `http://localhost:3000`. If it doesn't, navigate to that URL manually.

### Step 3: Verify Installation

1. **Check backend is running:**
   - Visit `http://localhost:5001` in your browser
   - You should see: `{"message": "UWDialed API is running"}`

2. **Check frontend is running:**
   - Visit `http://localhost:3000` in your browser
   - You should see the UWDialed home page with navigation options

3. **Test the connection:**
   - Click "View Dashboard" on the home page
   - Study spots should load from the database (if the database is populated)

### Troubleshooting

**Backend Issues:**
- **Database connection errors:** Verify your `.env` file has correct credentials and the database server is accessible
- **Port 5001 already in use:** Change the port in `app.py` or stop the process using port 5001
- **Module not found errors:** Ensure you're in the virtual environment and all dependencies are installed

**Frontend Issues:**
- **API connection errors:** Verify the backend is running and `REACT_APP_API_URL` matches the backend port
- **Map not displaying:** Check that `REACT_APP_MAPBOX_TOKEN` is set correctly in the `.env` file
- **Port 3000 already in use:** React will prompt you to use a different port, or you can set `PORT=3001` in your `.env` file

**Common Solutions:**
- Clear browser cache if you see stale data
- Restart both servers after changing environment variables
- Check browser console (F12) for detailed error messages
- Ensure both backend and frontend are running simultaneously

### Project Structure

```
Project/
├── src/
│   ├── backend/          # Flask API server
│   │   ├── app.py        # Main application entry point
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic and database services
│   │   ├── requirements.txt
│   │   └── .env          # Database credentials (create this)
│   │
│   └── frontend/         # React application
│       ├── src/
│       │   ├── App.js    # Main React component
│       │   ├── Dashboard.js
│       │   ├── map.js
│       │   └── services/ # API client
│       ├── package.json
│       └── .env          # Frontend environment variables (create this)
│
├── docs/                 # Project documentation
├── tests/                # Test files
└── README.md            # This file
```

### Development Workflow

1. **Start the backend server** (Terminal 1):
   ```bash
   cd src/backend
   source venv/bin/activate  # If using virtual environment
   python app.py
   ```

2. **Start the frontend server** (Terminal 2):
   ```bash
   cd src/frontend
   npm start
   ```

3. **Make changes** to the code - both servers support hot-reloading

4. **Stop servers** by pressing `Ctrl+C` in each terminal

### Additional Resources

- **User Manual:** See `docs/user_manual.md` for end-user instructions
- **API Documentation:** See `src/backend/README.md` for API endpoint details
- **Project Charter:** See `docs/charter.md` for project scope and requirements

---

For questions or issues, please refer to the project documentation or contact the development team.