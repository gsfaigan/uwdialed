import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Survey from './components/Survey';
// import Recommendations from './components/Recommendations';
import MapPage from './map';
import Dashboard from './Dashboard';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/survey" element={<Survey />} />
        {/* <Route path="/recommendations" element={<Recommendations />} /> */}
      </Routes>
      {!isHomePage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <img
          src="/uw-logo.png"
          alt="University of Waterloo Logo"
          className="uw-logo"
        />
        <h1>UWDialed</h1>
        <p>Discover optimal study spots at University of Waterloo</p>
        <nav className="home-nav">
          <Link to="/dashboard" className="home-link primary">
            View Dashboard
          </Link>
          <Link to="/map" className="home-link primary">
            View Map
          </Link>
          <Link to="/survey" className="home-link secondary">
            Take Survey
          </Link>
        </nav>
      </div>
      <Footer />
    </div>
  );
}

export default App;
