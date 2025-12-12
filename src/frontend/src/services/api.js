/**
 * API service for communicating with the backend
 * Update API_BASE_URL when backend is ready
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Study spots API
export const studySpotsAPI = {
  getAll: () => api.get('/study-spots'),
  getById: (id) => api.get(`/study-spots/${id}`),
  create: (data) => api.post('/study-spots', data),
  update: (id, data) => api.put(`/study-spots/${id}`, data),
  delete: (id) => api.delete(`/study-spots/${id}`),
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendation: (preferences) => api.post('/study-spots/recommend', preferences),
};

// Reviews API
export const reviewsAPI = {
  getAll: (studySpotId) => {
    if (studySpotId) {
      return api.get(`/reviews?studySpotId=${studySpotId}`);
    }
    return api.get('/reviews');
  },
  getByStudySpot: (studySpotId) => api.get(`/reviews/${studySpotId}`),
  create: (data) => api.post('/reviews', data),
};

export default api;