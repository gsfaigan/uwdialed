import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsAPI } from '../services/api';
import '../App.css';

const SURVEY_COOKIE = 'surveyResponses';

const surveyQuestions = [
  {
    key: 'locationType',
    prompt: 'What type of location do you prefer to study in?',
    options: ['Library', 'Café', 'University building', 'Outdoors', 'No preference'],
  },
  {
    key: 'travelDistance',
    prompt: 'How far are you willing to travel to your study spot?',
    options: ['Walking distance', '10-20 minutes', '20-40 minutes', 'No preference'],
  },
  {
    key: 'busyness',
    prompt: 'How busy do you prefer your study environment to be?',
    options: ['Very quiet', 'Moderately busy', 'Busy/active', 'No preference'],
  },
  {
    key: 'powerAccess',
    prompt: 'How important is having access to power outlets?',
    options: ['Essential', 'Helpful but not required', 'Not important'],
  },
  {
    key: 'foodImportance',
    prompt: 'How important is being close to food or drink options?',
    options: ['Very important', 'Somewhat important', 'Not important'],
  },
  {
    key: 'foodPreference',
    prompt: 'What type of food/drink options do you prefer nearby?',
    options: ['Coffee shops', 'Quick snacks', 'Full meals', 'Vending machines', 'No preference'],
  },
  {
    key: 'noiseLevel',
    prompt: 'What noise level helps you focus best?',
    options: [
      'Silent',
      'Low background noise',
      'Moderate conversational noise',
      'Lively café-like noise',
      'No preference',
    ],
  },
  {
    key: 'lighting',
    prompt: 'What level of natural lighting do you prefer?',
    options: ['Bright natural light', 'Some natural light', 'Low/no natural light', 'No preference'],
  },
];

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

const setCookieValue = (name, value, days = 30) => {
  if (typeof document === 'undefined') {
    return;
  }
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/`;
};

const Survey = () => {
  const savedPreferences = useMemo(() => getCookieValue(SURVEY_COOKIE), []);
  const hasSavedPreferences = savedPreferences && Object.values(savedPreferences).some(val => val !== '');

  const initialResponses = useMemo(() => {
    return Object.fromEntries(surveyQuestions.map(({ key }) => [key, '']));
  }, []);

  const [showPreferencesSummary, setShowPreferencesSummary] = useState(hasSavedPreferences);
  const [responses, setResponses] = useState(initialResponses);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === surveyQuestions.length - 1;
  const totalQuestions = surveyQuestions.length;

  const handleOptionClick = async (option) => {
    if (isAnimating) return;

    const key = currentQuestion.key;
    const updatedResponses = {
      ...responses,
      [key]: option,
    };
    setResponses(updatedResponses);

    // Auto-advance to next question if not the last one
    if (!isLastQuestion) {
      setIsAnimating(true);
      setSlideDirection('next');

      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Last question - auto-save and show loading
      setIsAnimating(true);
      setTimeout(async () => {
        setIsLoading(true);
        await handleSubmit(updatedResponses);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection('prev');

      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async (finalResponses) => {
    setCookieValue(SURVEY_COOKIE, finalResponses);

    try {
      const { data } = await recommendationsAPI.getRecommendation(finalResponses);

      if (data?.recommended_spots) {
        console.log('Recommended study spots:', data.recommended_spots);
      } else {
        console.log('No recommendations returned:', data);
      }

      // Simulate a minimum loading time for better UX
      setTimeout(() => {
        setIsLoading(false);
        setIsComplete(true);
      }, 1500);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setTimeout(() => {
        setIsLoading(false);
        setIsComplete(true);
      }, 1500);
    }
  };

  // Preferences summary screen (if user has taken survey before)
  if (showPreferencesSummary && savedPreferences) {
    return (
      <div className="survey-page">
        <header className="survey-header">
          <h1>Your Current Preferences</h1>
          <p>You've already completed the survey. Here are your saved preferences:</p>
        </header>

        <div className="preferences-summary">
          {surveyQuestions.map(({ key, prompt }) => (
            <div key={key} className="preference-item">
              <div className="preference-question">{prompt}</div>
              <div className="preference-answer">
                {savedPreferences[key] || 'Not answered'}
              </div>
            </div>
          ))}

          <button
            className="retake-survey-btn"
            onClick={() => setShowPreferencesSummary(false)}
            type="button"
          >
            Retake Survey
          </button>
        </div>

        <div className="survey-footer">
          <Link to="/" className="cancel-link">Cancel</Link>
        </div>
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="survey-page">
        <div className="survey-loading">
          <div className="loading-spinner"></div>
          <h2>Generating Your Personalized Recommendations...</h2>
          <p>We're analyzing your preferences to find the perfect study spots for you.</p>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    return (
      <div className="survey-page">
        <div className="survey-complete">
          <div className="complete-icon">✓</div>
          <h2>Preferences Saved Successfully!</h2>
          <p>Your personalized study spot recommendations are ready.</p>
          <Link to="/dashboard" className="dashboard-link">
            View Your Personalized Dashboard
          </Link>
          <div className="survey-footer">
            <Link to="/">Return home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Survey questions
  return (
    <div className="survey-page">
      <header className="survey-header">
        <h1>Study Spot Survey</h1>
        <p>Answer a few questions so we can personalize your study recommendations.</p>
      </header>

      <div className="survey-card-container">
        <div className="survey-progress">
          Q {currentQuestionIndex + 1}/{totalQuestions}
        </div>

        <div className={`survey-card ${isAnimating ? `slide-${slideDirection}` : ''}`}>
          <div className="survey-card-content">
            <h2 className="survey-card-question">{currentQuestion.prompt}</h2>

            <div className="survey-options">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  className={`survey-option ${responses[currentQuestion.key] === option ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="survey-navigation">
          {currentQuestionIndex > 0 && (
            <button
              className="survey-nav-btn survey-prev"
              onClick={handlePrevious}
              disabled={isAnimating}
              type="button"
            >
              ← Previous
            </button>
          )}
          <div className="survey-nav-spacer"></div>
        </div>
      </div>

      <div className="survey-footer">
        <Link to="/" className="cancel-link">Cancel</Link>
      </div>
    </div>
  );
};

export default Survey;

