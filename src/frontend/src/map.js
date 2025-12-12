import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';
import { studySpotsAPI } from './services/api';

function MapPage() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const markersRef = useRef([]); // Track markers to avoid duplicates
  const [studySpots, setStudySpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // University of Waterloo coordinates
  const viewState = {
    longitude: -80.5426,
    latitude: 43.4723,
    zoom: 15
  };
  
  // Fetch study spots from the database
  useEffect(() => {
    const fetchStudySpots = async () => {
      try {
        setLoading(true);
        const response = await studySpotsAPI.getAll();
        const spots = response.data.study_spots || response.data || [];
        console.log(spots);
        setStudySpots(spots);
        setError(null);
      } catch (err) {
        console.error('Error fetching study spots:', err);
        setError('Failed to load study spots. Please try again later.');
        // Fallback to empty array if API fails
        setStudySpots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudySpots();
  }, []);

  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

  // Helper function to format power values
  const formatPower = (value) => {
    if (!value) return 'N/A';
    // Convert Y/N to Yes/No
    if (value === 'Y') return 'Yes';
    if (value === 'N') return 'No';
    return value; // 'Limited' stays as is
  };

  // Function to clear all existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(({ marker, hoverPopup, clickPopup }) => {
      marker.remove();
      if (hoverPopup && hoverPopup.parentNode) {
        hoverPopup.parentNode.removeChild(hoverPopup);
      }
      if (clickPopup && clickPopup.parentNode) {
        clickPopup.parentNode.removeChild(clickPopup);
      }
    });
    markersRef.current = [];
  };

  // Function to add markers to the map
  const addMarkers = (map, locations) => {
    // Clear existing markers first
    clearMarkers();
    
    locations.forEach(spot => {
      // Skip spots without required coordinates
      if (!spot.longitude || !spot.latitude) {
        console.warn(`Skipping spot ${spot.id || spot.location}: missing coordinates`);
        return;
      }

      // Create a modern marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cursor = 'pointer';
      el.style.width = '32px';
      el.style.height = '32px';
      // Don't set position - let Mapbox handle it
      
      // Create inner circle for marker
      const markerInner = document.createElement('div');
      markerInner.className = 'marker-inner';
      el.appendChild(markerInner);

      // Build location name
      const locationName = spot.location || spot.name || 'Study Spot';
      
      // Create simple hover popup (name only)
      const hoverPopupEl = document.createElement('div');
      hoverPopupEl.className = 'hover-popup';
      hoverPopupEl.style.display = 'none';
      hoverPopupEl.innerHTML = `
        <div class="hover-popup-content">
          ${locationName}
        </div>
      `;
      document.body.appendChild(hoverPopupEl);
      
      // Create detailed click popup (full information)
      const clickPopupEl = document.createElement('div');
      clickPopupEl.className = 'custom-popup';
      clickPopupEl.style.display = 'none';
      
      const details = [];
      if (spot.busyness_estimate !== null && spot.busyness_estimate !== undefined) {
        details.push({ icon: '👥', label: 'Busyness', value: spot.busyness_estimate });
      }
      if (spot.noise_level) {
        details.push({ icon: '🔊', label: 'Noise', value: spot.noise_level });
      }
      if (spot.power_options) {
        details.push({ icon: '🔌', label: 'Power', value: formatPower(spot.power_options) });
      }
      if (spot.nearby_food_drink_options) {
        details.push({ icon: '🍽️', label: 'Food', value: spot.nearby_food_drink_options });
      }
      if (spot.natural_lighting) {
        details.push({ icon: '💡', label: 'Lighting', value: spot.natural_lighting });
      }
      
      clickPopupEl.innerHTML = `
        <div class="popup-content">
          <h3 class="popup-title">${locationName}</h3>
          <div class="popup-details">
            ${details.map(d => `
              <div class="popup-detail-item">
                <span class="detail-icon">${d.icon}</span>
                <span class="detail-label">${d.label}:</span>
                <span class="detail-value">${d.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      document.body.appendChild(clickPopupEl);

      // Hover popup positioning (simple name only)
      let hoverTimeout;
      const updateHoverPopupPosition = () => {
        const rect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Ensure hover popup is visible to get its dimensions
        if (hoverPopupEl.style.display === 'none') {
          hoverPopupEl.style.display = 'block';
          hoverPopupEl.style.visibility = 'hidden';
        }
        
        const hoverRect = hoverPopupEl.getBoundingClientRect();
        const hoverWidth = hoverRect.width || 150;
        
        // Calculate position (centered above marker)
        let left = rect.left + rect.width / 2;
        let top = rect.top - 10;
        
        // Check horizontal boundaries
        if (left - hoverWidth / 2 < 10) {
          left = hoverWidth / 2 + 10;
        } else if (left + hoverWidth / 2 > viewportWidth - 10) {
          left = viewportWidth - hoverWidth / 2 - 10;
        }
        
        hoverPopupEl.style.left = `${left}px`;
        hoverPopupEl.style.top = `${top}px`;
        hoverPopupEl.style.transform = 'translate(-50%, -100%)';
        hoverPopupEl.style.visibility = 'visible';
      };

      // Detailed popup positioning (full info on click)
      let clickPopupTimeout;
      const updateClickPopupPosition = () => {
        const rect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (clickPopupEl.style.display === 'none') {
          clickPopupEl.style.display = 'block';
          clickPopupEl.style.visibility = 'hidden';
        }
        
        const popupRect = clickPopupEl.getBoundingClientRect();
        const popupWidth = popupRect.width || 300;
        const popupHeight = popupRect.height || 150;
        
        let left = rect.left + rect.width / 2;
        let top = rect.top - 10;
        
        // Horizontal boundaries
        if (left - popupWidth / 2 < 10) {
          left = popupWidth / 2 + 10;
        } else if (left + popupWidth / 2 > viewportWidth - 10) {
          left = viewportWidth - popupWidth / 2 - 10;
        }
        
        // Vertical boundaries
        if (top - popupHeight < 10) {
          top = rect.bottom + 10;
          clickPopupEl.style.transform = 'translate(-50%, 0)';
        } else {
          clickPopupEl.style.transform = 'translate(-50%, -100%)';
        }
        
        if (top + popupHeight > viewportHeight - 10) {
          top = viewportHeight - popupHeight - 10;
        }
        
        clickPopupEl.style.left = `${left}px`;
        clickPopupEl.style.top = `${top}px`;
        clickPopupEl.style.visibility = 'visible';
      };

      // Hover event - show name only
      el.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        // Hide click popup if visible
        clickPopupEl.style.display = 'none';
        clickPopupEl.style.visibility = 'hidden';
        
        // Update position on map move/zoom
        const moveHandler = () => updateHoverPopupPosition();
        map.on('move', moveHandler);
        map.on('zoom', moveHandler);
        
        el._hoverMoveHandler = moveHandler;
        updateHoverPopupPosition();
      });

      el.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          hoverPopupEl.style.display = 'none';
          hoverPopupEl.style.visibility = 'hidden';
          if (el._hoverMoveHandler) {
            map.off('move', el._hoverMoveHandler);
            map.off('zoom', el._hoverMoveHandler);
            delete el._hoverMoveHandler;
          }
        }, 100);
      });

      // Click event - show full details
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        // Hide hover popup
        hoverPopupEl.style.display = 'none';
        hoverPopupEl.style.visibility = 'hidden';
        
        // Toggle click popup
        if (clickPopupEl.style.display === 'block' && clickPopupEl.style.visibility === 'visible') {
          // Close if already open
          clickPopupEl.style.display = 'none';
          clickPopupEl.style.visibility = 'hidden';
          if (el._clickMoveHandler) {
            map.off('move', el._clickMoveHandler);
            map.off('zoom', el._clickMoveHandler);
            delete el._clickMoveHandler;
          }
        } else {
          // Open click popup
          const moveHandler = () => updateClickPopupPosition();
          map.on('move', moveHandler);
          map.on('zoom', moveHandler);
          el._clickMoveHandler = moveHandler;
          updateClickPopupPosition();
        }
      });

      // Keep hover popup visible when hovering over it
      hoverPopupEl.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
      });

      hoverPopupEl.addEventListener('mouseleave', () => {
        hoverPopupEl.style.display = 'none';
        hoverPopupEl.style.visibility = 'hidden';
        if (el._hoverMoveHandler) {
          map.off('move', el._hoverMoveHandler);
          map.off('zoom', el._hoverMoveHandler);
          delete el._hoverMoveHandler;
        }
      });

      // Keep click popup visible when hovering over it
      clickPopupEl.addEventListener('mouseenter', () => {
        clearTimeout(clickPopupTimeout);
      });

      clickPopupEl.addEventListener('mouseleave', () => {
        clickPopupTimeout = setTimeout(() => {
          clickPopupEl.style.display = 'none';
          clickPopupEl.style.visibility = 'hidden';
          if (el._clickMoveHandler) {
            map.off('move', el._clickMoveHandler);
            map.off('zoom', el._clickMoveHandler);
            delete el._clickMoveHandler;
          }
        }, 100);
      });

      // Create the marker - anchor at bottom so tip points to coordinate
      // Mapbox will automatically keep this fixed to the lat/lng position
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom' // Bottom anchor ensures tip points to coordinate
      })
        .setLngLat([parseFloat(spot.longitude), parseFloat(spot.latitude)])
        .addTo(map);
      
      // Store marker and popup references
      markersRef.current.push({ marker, hoverPopup: hoverPopupEl, clickPopup: clickPopupEl });
    });
  };

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    console.log('Initializing map...');
    console.log('Container:', mapContainerRef.current);
    
    if (!mapContainerRef.current) {
      return;
    }
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Colorful streets style
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: 30, // Subtle 3D tilt for modern look
      bearing: 0
    });

    const map = mapRef.current;

    map.on('load', () => {
      console.log('Map loaded successfully!');
      // Try to add markers if data is already available
      if (studySpots.length > 0) {
        addMarkers(map, studySpots);
      }
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
    });

    // Cleanup on unmount
    return () => {
      clearMarkers();
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []); // Only run once on mount

  // Update markers when study spots data changes or when map becomes ready
  useEffect(() => {
    if (mapRef.current) {
      if (mapRef.current.loaded()) {
        // Map is already loaded, add markers immediately
        if (studySpots.length > 0) {
          addMarkers(mapRef.current, studySpots);
        }
      } else {
        // Map not loaded yet, wait for it
        const handleMapLoad = () => {
          if (studySpots.length > 0) {
            addMarkers(mapRef.current, studySpots);
          }
          mapRef.current.off('load', handleMapLoad);
        };
        mapRef.current.on('load', handleMapLoad);
        
        return () => {
          if (mapRef.current) {
            mapRef.current.off('load', handleMapLoad);
          }
        };
      }
    }
  }, [studySpots]); // Run when studySpots changes

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000',
      padding: '0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="map-header">
        <Link to="/" className="home-button">
          Home
        </Link>
      </div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {loading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <span>Loading study spots...</span>
        </div>
      )}
      <div 
        id="map-container"
        ref={mapContainerRef}
      />
    </div>
  );
}

export default MapPage;

