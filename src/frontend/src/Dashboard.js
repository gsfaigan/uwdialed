import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Dashboard.css';
import { studySpotsAPI, recommendationsAPI, reviewsAPI } from './services/api';

const SURVEY_COOKIE = 'surveyResponses';

const getCookieValue = (name) => {
  if (typeof document === 'undefined') {
    return null;
  }
  const cookieString = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  if (!cookieString) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(cookieString.split('=')[1]));
  } catch {
    return null;
  }
};

function Dashboard() {
  const [studySpots, setStudySpots] = useState([]);
  const [recommendedSpots, setRecommendedSpots] = useState([]);
  const [filteredRecommended, setFilteredRecommended] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    stars: 5,
    review: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [notification, setNotification] = useState(null);
  const [cardPosition, setCardPosition] = useState(null);
  const [modalContentReady, setModalContentReady] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

  // Filter states
  const [filters, setFilters] = useState({
    busyness: 'all',
    noise: 'all',
    power: 'all',
    food: 'all',
    lighting: 'all'
  });

  // Sort state
  const [sortBy, setSortBy] = useState('name');

  // Dynamic filter options based on actual data
  const [filterOptions, setFilterOptions] = useState({
    noise: [],
    power: [],
    food: [],
    lighting: []
  });

  // Fetch study spots and recommendations from the database
  useEffect(() => {
    const fetchStudySpots = async () => {
      try {
        setLoading(true);
        const response = await studySpotsAPI.getAll();
        const spots = response.data.study_spots || response.data || [];
        console.log('Fetched study spots:', spots);

        // Check if user has completed the survey
        const surveyResponses = getCookieValue(SURVEY_COOKIE);
        let recommended = [];
        let remainingSpots = spots;

        if (surveyResponses && Object.values(surveyResponses).some(val => val !== '')) {
          try {
            const recResponse = await recommendationsAPI.getRecommendation(surveyResponses);
            recommended = recResponse.data.recommended_spots || [];
            console.log('Fetched recommendations:', recommended);

            // Filter out recommended spots from the main list to avoid duplicates
            const recommendedIds = new Set(recommended.map(s => s.id));
            remainingSpots = spots.filter(s => !recommendedIds.has(s.id));
          } catch (recErr) {
            console.error('Error fetching recommendations:', recErr);
            // Continue without recommendations if the API call fails
          }
        }

        setRecommendedSpots(recommended);
        setFilteredRecommended(recommended);
        setStudySpots(remainingSpots);
        setFilteredSpots(remainingSpots);

        // Extract unique values for filters from actual data (all spots)
        const allSpots = [...recommended, ...remainingSpots];
        const uniqueNoise = [...new Set(allSpots.map(s => s.noise_level).filter(Boolean))];
        const uniquePower = [...new Set(allSpots.map(s => s.power_options).filter(Boolean))];
        const uniqueFood = [...new Set(allSpots.map(s => s.nearby_food_drink_options).filter(Boolean))];
        const uniqueLighting = [...new Set(allSpots.map(s => s.natural_lighting).filter(Boolean))];

        setFilterOptions({
          noise: uniqueNoise,
          power: uniquePower,
          food: uniqueFood,
          lighting: uniqueLighting
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching study spots:', err);
        setError('Failed to load study spots. Please try again later.');
        setStudySpots([]);
        setFilteredSpots([]);
        setRecommendedSpots([]);
        setFilteredRecommended([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudySpots();
  }, []);

  // Helper function to apply filters to a list of spots
  const applyFiltersAndSort = useCallback((spots) => {
    let result = [...spots];

    // Apply filters using exact matching from database values
    if (filters.busyness !== 'all') {
      result = result.filter(spot => {
        const busyness = spot.busyness_estimate;
        if (busyness === null || busyness === undefined) return false;

        // Convert both to numbers for comparison
        const filterValue = parseInt(filters.busyness);
        const spotBusyness = typeof busyness === 'number' ? busyness : parseInt(busyness);
        return spotBusyness === filterValue;
      });
    }

    if (filters.noise !== 'all') {
      result = result.filter(spot => spot.noise_level === filters.noise);
    }

    if (filters.power !== 'all') {
      result = result.filter(spot => spot.power_options === filters.power);
    }

    if (filters.food !== 'all') {
      result = result.filter(spot => spot.nearby_food_drink_options === filters.food);
    }

    if (filters.lighting !== 'all') {
      result = result.filter(spot => spot.natural_lighting === filters.lighting);
    }

    // Apply sorting using only stored database parameters
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.location || '').localeCompare(b.location || '');
        case 'busyness-asc':
          return (a.busyness_estimate || 0) - (b.busyness_estimate || 0);
        case 'busyness-desc':
          return (b.busyness_estimate || 0) - (a.busyness_estimate || 0);
        case 'noise-asc':
          return (a.noise_level || '').localeCompare(b.noise_level || '');
        case 'noise-desc':
          return (b.noise_level || '').localeCompare(a.noise_level || '');
        default:
          return 0;
      }
    });

    return result;
  }, [filters, sortBy]);

  // Apply filters and sorting to both recommended and remaining spots whenever they change
  useEffect(() => {
    setFilteredRecommended(applyFiltersAndSort(recommendedSpots));
    setFilteredSpots(applyFiltersAndSort(studySpots));
  }, [studySpots, recommendedSpots, applyFiltersAndSort]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      busyness: 'all',
      noise: 'all',
      power: 'all',
      food: 'all',
      lighting: 'all'
    });
    setSortBy('name');
  };

  const openDetailView = (spot, event) => {
    // Get the clicked card's position
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    setCardPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });

    setSelectedSpot(spot);
    setModalContentReady(false);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Delay loading heavy content until after zoom animation
    setTimeout(() => {
      setModalContentReady(true);
    }, 400); // Match animation duration
  };

  const closeDetailView = () => {
    // Hide heavy content immediately before animation starts
    setModalContentReady(false);

    // Start closing animation after a brief delay to let content unload
    setTimeout(() => {
      setIsClosing(true);
    }, 50);

    // Wait for animation to complete, then cleanup
    setTimeout(() => {
      // Clean up map and marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Double RAF to ensure animation is fully complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSelectedSpot(null);
          setReviews([]);
          setReviewForm({ name: '', stars: 5, review: '' });
          setHoveredStar(0);
          setIsClosing(false);
          setCardPosition(null);

          // Re-enable body scroll
          requestAnimationFrame(() => {
            document.body.style.overflow = '';
          });
        });
      });
    }, 500); // Extended delay to ensure animation fully completes
  };

  // Fetch reviews when a spot is selected
  useEffect(() => {
    if (!selectedSpot || !selectedSpot.id) {
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await reviewsAPI.getByStudySpot(selectedSpot.id);
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [selectedSpot]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSpot || !selectedSpot.id) {
      return;
    }

    if (!reviewForm.name.trim() || !reviewForm.review.trim()) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewsAPI.create({
        studySpotId: selectedSpot.id,
        name: reviewForm.name.trim(),
        stars: reviewForm.stars,
        review: reviewForm.review.trim()
      });

      // Refresh reviews after submission
      const response = await reviewsAPI.getByStudySpot(selectedSpot.id);
      setReviews(response.data.reviews || []);

      // Reset form
      setReviewForm({ name: '', stars: 5, review: '' });
      setHoveredStar(0);
      showNotification('Review submitted successfully!', 'success');
    } catch (err) {
      console.error('Error submitting review:', err);
      showNotification('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle review form input changes
  const handleReviewFormChange = (field, value) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Initialize Mapbox map when a spot is selected and animation is complete
  useEffect(() => {
    if (!selectedSpot || !modalContentReady) {
      return;
    }

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) {
        return;
      }

      // Check if coordinates are available
      if (!selectedSpot.latitude || !selectedSpot.longitude) {
        return;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Initialize map
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [parseFloat(selectedSpot.longitude), parseFloat(selectedSpot.latitude)],
        zoom: 16,
        pitch: 30,
        bearing: 0
      });

      const map = mapRef.current;

      map.on('load', () => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cursor = 'pointer';
        el.style.width = '32px';
        el.style.height = '32px';
        
        const markerInner = document.createElement('div');
        markerInner.className = 'marker-inner';
        el.appendChild(markerInner);

        // Create and add marker
        markerRef.current = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([parseFloat(selectedSpot.longitude), parseFloat(selectedSpot.latitude)])
          .addTo(map);
      });
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [selectedSpot, modalContentReady, MAPBOX_TOKEN]);

  const formatBusyness = (value) => {
    if (value === null || value === undefined) return 'N/A';
    // Display as X/5 format
    if (value >= 0 && value <= 5) {
      return `${value}/5`;
    }
    return value.toString();
  };

  const formatPower = (value) => {
    if (!value) return 'N/A';
    // Convert Y/N to Yes/No
    if (value === 'Y') return 'Yes';
    if (value === 'N') return 'No';
    return value; // 'Limited' stays as is
  };

  // Helper function to get image path from location name
  const getImagePath = (location) => {
    if (!location) return null;
    // Convert location to image filename format
    // Replace spaces with underscores, convert to lowercase, and add .jpg extension
    const imageName = location.toLowerCase().replace(/\s+/g, '_') + '.jpg';
    return `/${imageName}`;
  };

  return (
    <div className="dashboard">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Home Button */}
      <div className="dashboard-nav">
        <Link to="/" className="home-button">
          Home
        </Link>
      </div>

      {/* Header */}
      <header className="dashboard-header">
        <h1>Study Spots Dashboard</h1>
        <p>Find the perfect study spot for your needs</p>
      </header>

      {/* Controls Section */}
      <div className="dashboard-controls">
        {/* Filters */}
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filters-grid">
            {/* Busyness Filter */}
            <div className="filter-group">
              <label>Busyness Level</label>
              <select
                value={filters.busyness}
                onChange={(e) => handleFilterChange('busyness', e.target.value)}
              >
                <option value="all">All</option>
                <option value="1">1/5</option>
                <option value="2">2/5</option>
                <option value="3">3/5</option>
                <option value="4">4/5</option>
                <option value="5">5/5</option>
              </select>
            </div>

            {/* Noise Level Filter */}
            <div className="filter-group">
              <label>Noise Level</label>
              <select
                value={filters.noise}
                onChange={(e) => handleFilterChange('noise', e.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.noise.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Power Outlets Filter */}
            <div className="filter-group">
              <label>Power Outlets</label>
              <select
                value={filters.power}
                onChange={(e) => handleFilterChange('power', e.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.power.map(option => (
                  <option key={option} value={option}>{formatPower(option)}</option>
                ))}
              </select>
            </div>

            {/* Food & Drink Filter */}
            <div className="filter-group">
              <label>Food & Drink</label>
              <select
                value={filters.food}
                onChange={(e) => handleFilterChange('food', e.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.food.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Natural Lighting Filter */}
            <div className="filter-group">
              <label>Natural Lighting</label>
              <select
                value={filters.lighting}
                onChange={(e) => handleFilterChange('lighting', e.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.lighting.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="reset-filters-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>

        {/* Sort Section */}
        <div className="sort-section">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name (A-Z)</option>
            <option value="busyness-asc">Least Busy First</option>
            <option value="busyness-desc">Most Busy First</option>
            <option value="noise-asc">Quietest First</option>
            <option value="noise-desc">Loudest First</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <span>Loading study spots...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && (
        <div className="results-count">
          {recommendedSpots.length > 0 && (
            <>
              Showing {filteredRecommended.length} recommended spots and {filteredSpots.length} other spots
              ({filteredRecommended.length + filteredSpots.length} of {recommendedSpots.length + studySpots.length} total)
            </>
          )}
          {recommendedSpots.length === 0 && (
            <>
              Showing {filteredSpots.length} of {studySpots.length} study spots
            </>
          )}
        </div>
      )}

      {/* Study Spots Grid */}
      {!loading && !error && (
        <>
          {filteredRecommended.length === 0 && filteredSpots.length === 0 ? (
            <div className="no-results">
              <p>No study spots match your filters.</p>
              <button onClick={resetFilters}>Reset Filters</button>
            </div>
          ) : (
            <>
              {/* Recommended Spots Section */}
              {filteredRecommended.length > 0 && (
                <>
                  <div className="recommended-section">
                    <h2 className="section-title">Recommended For You</h2>
                    <div className="study-spots-grid">
                      {filteredRecommended.map(spot => (
                        <div
                          key={spot.id}
                          className="study-spot-card recommended-card"
                          onClick={(e) => openDetailView(spot, e)}
                        >
                          <div className="recommended-badge">Recommended</div>
                          <h3 className="spot-name">{spot.location || 'Unknown Location'}</h3>

                          <div className="spot-attributes">
                            {/* Busyness */}
                            {spot.busyness_estimate !== null && spot.busyness_estimate !== undefined && (
                              <div className="attribute">
                                <span className="attribute-icon">👥</span>
                                <span className="attribute-label">Busyness:</span>
                                <span className="attribute-value">
                                  {formatBusyness(spot.busyness_estimate)}
                                </span>
                              </div>
                            )}

                            {/* Noise Level */}
                            {spot.noise_level && (
                              <div className="attribute">
                                <span className="attribute-icon">🔊</span>
                                <span className="attribute-label">Noise:</span>
                                <span className="attribute-value">{spot.noise_level}</span>
                              </div>
                            )}

                            {/* Power Outlets */}
                            {spot.power_options && (
                              <div className="attribute">
                                <span className="attribute-icon">🔌</span>
                                <span className="attribute-label">Power:</span>
                                <span className="attribute-value">{formatPower(spot.power_options)}</span>
                              </div>
                            )}

                            {/* Food & Drink */}
                            {spot.nearby_food_drink_options && (
                              <div className="attribute">
                                <span className="attribute-icon">🍽️</span>
                                <span className="attribute-label">Food:</span>
                                <span className="attribute-value">{spot.nearby_food_drink_options}</span>
                              </div>
                            )}

                            {/* Natural Lighting */}
                            {spot.natural_lighting && (
                              <div className="attribute">
                                <span className="attribute-icon">💡</span>
                                <span className="attribute-label">Lighting:</span>
                                <span className="attribute-value">{spot.natural_lighting}</span>
                              </div>
                            )}
                          </div>

                          <div className="card-footer">
                            <span className="view-details">Click for details →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  {filteredSpots.length > 0 && (
                    <div className="section-divider">
                      <hr />
                      <span>Other Study Spots</span>
                      <hr />
                    </div>
                  )}
                </>
              )}

              {/* Remaining Spots Section */}
              {filteredSpots.length > 0 && (
                <div className="study-spots-grid">
                  {filteredSpots.map(spot => (
                    <div
                      key={spot.id}
                      className="study-spot-card"
                      onClick={(e) => openDetailView(spot, e)}
                    >
                      <h3 className="spot-name">{spot.location || 'Unknown Location'}</h3>

                      <div className="spot-attributes">
                        {/* Busyness */}
                        {spot.busyness_estimate !== null && spot.busyness_estimate !== undefined && (
                          <div className="attribute">
                            <span className="attribute-icon">👥</span>
                            <span className="attribute-label">Busyness:</span>
                            <span className="attribute-value">
                              {formatBusyness(spot.busyness_estimate)}
                            </span>
                          </div>
                        )}

                        {/* Noise Level */}
                        {spot.noise_level && (
                          <div className="attribute">
                            <span className="attribute-icon">🔊</span>
                            <span className="attribute-label">Noise:</span>
                            <span className="attribute-value">{spot.noise_level}</span>
                          </div>
                        )}

                        {/* Power Outlets */}
                        {spot.power_options && (
                          <div className="attribute">
                            <span className="attribute-icon">🔌</span>
                            <span className="attribute-label">Power:</span>
                            <span className="attribute-value">{formatPower(spot.power_options)}</span>
                          </div>
                        )}

                        {/* Food & Drink */}
                        {spot.nearby_food_drink_options && (
                          <div className="attribute">
                            <span className="attribute-icon">🍽️</span>
                            <span className="attribute-label">Food:</span>
                            <span className="attribute-value">{spot.nearby_food_drink_options}</span>
                          </div>
                        )}

                        {/* Natural Lighting */}
                        {spot.natural_lighting && (
                          <div className="attribute">
                            <span className="attribute-icon">💡</span>
                            <span className="attribute-label">Lighting:</span>
                            <span className="attribute-value">{spot.natural_lighting}</span>
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <span className="view-details">Click for details →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedSpot && (
        <div className={`detail-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={closeDetailView}>
          <div
            className={`detail-modal ${isClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              '--card-top': cardPosition ? `${cardPosition.top}px` : '50%',
              '--card-left': cardPosition ? `${cardPosition.left}px` : '50%',
              '--card-width': cardPosition ? `${cardPosition.width}px` : '400px',
              '--card-height': cardPosition ? `${cardPosition.height}px` : '300px',
              '--card-width-unitless': cardPosition ? cardPosition.width : 400
            }}
          >
            <button className="close-modal-btn" onClick={closeDetailView}>×</button>

            <h2 className="modal-title">{selectedSpot.location || 'Unknown Location'}</h2>

            {/* Study Spot Image - Load after animation, unload before closing */}
            {modalContentReady && getImagePath(selectedSpot.location) && (
              <div className="modal-image-container">
                <img
                  src={getImagePath(selectedSpot.location)}
                  alt={selectedSpot.location || 'Study spot'}
                  className="modal-image"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Mapbox Map - Load after animation, unload before closing */}
            {modalContentReady && selectedSpot.latitude && selectedSpot.longitude && (
              <div className="modal-map-container">
                <div
                  ref={mapContainerRef}
                  className="modal-map"
                />
              </div>
            )}

            <div className="modal-content">
              {/* Reviews Section */}
              <div className="reviews-section">
                <h3 className="reviews-title">Reviews</h3>
                
                {loadingReviews ? (
                  <div className="loading-reviews">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="no-reviews">No reviews yet. Be the first to leave a review!</div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <span className="review-name">{review.name}</span>
                          <div className="review-stars">
                            {'⭐'.repeat(review.stars)}
                          </div>
                          {review.created_at && (
                            <span className="review-date">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="review-text">{review.review}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leave a Review Form */}
              <div className="review-form-section">
                <h3 className="review-form-title">Leave a Review</h3>
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="form-group">
                    <label htmlFor="review-name">Your Name *</label>
                    <input
                      type="text"
                      id="review-name"
                      value={reviewForm.name}
                      onChange={(e) => handleReviewFormChange('name', e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Rating *</label>
                    <div 
                      className="star-rating"
                      onMouseLeave={() => setHoveredStar(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoveredStar || reviewForm.stars);
                        return (
                          <span
                            key={star}
                            className={`star ${isFilled ? 'filled' : ''}`}
                            onClick={() => handleReviewFormChange('stars', star)}
                            onMouseEnter={() => setHoveredStar(star)}
                          >
                            ⭐
                          </span>
                        );
                      })}
                      <span className="rating-text">
                        {hoveredStar > 0 
                          ? `${hoveredStar} out of 5` 
                          : reviewForm.stars === 0 
                            ? 'Click to rate' 
                            : `${reviewForm.stars} out of 5`}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-text">Your Review *</label>
                    <textarea
                      id="review-text"
                      value={reviewForm.review}
                      onChange={(e) => handleReviewFormChange('review', e.target.value)}
                      placeholder="Share your experience..."
                      rows="4"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="submit-review-btn"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
