import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Confetti from '../Confetti';
import RatingChart from '../RatingChart';

interface Store {
  id: number;
  name: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
  owner: {
    name: string;
    email: string;
  };
  ratings: Array<{
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      name: string;
    };
  }>;
}

const StoreRating: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchStoreDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/stores/${id}`);
      const storeData = response.data.store;
      setStore(storeData);
      setRating(storeData.userRating || 0);
    } catch (error) {
      console.error('Failed to fetch store details:', error);
      setError('Failed to load store details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStoreDetails();
    }
  }, [id, fetchStoreDetails]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      showError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/rating', {
        storeId: parseInt(id!),
        rating,
        comment
      });
      // Refresh store data
      await fetchStoreDetails();
      showSuccess(rating >= 4 ? 'Thank you for your excellent rating! 🌟' : 'Rating submitted successfully!');
      if (rating >= 4) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setComment('');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to submit rating';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && setRating(i + 1)}
        className={`h-8 w-8 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${
          interactive ? 'hover:text-yellow-300 cursor-pointer' : ''
        }`}
      >
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Store not found</p>
      </div>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = store.ratings.reduce((acc: { [key: number]: number }, rating) => {
    acc[rating.rating] = (acc[rating.rating] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Confetti trigger={showConfetti} />
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center space-x-1 transition-transform hover:translate-x-[-4px]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Store Directory</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2 animate-slide-up">{store.name}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{store.address}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Info */}
        <div className="modern-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Store Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</span>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">{store.owner.name}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">{store.owner.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
              <svg className="h-5 w-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-600">Overall Rating</span>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(store.averageRating))}
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {store.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        {store.totalRatings > 0 && (
          <div className="modern-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-gradient-warning rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Rating Distribution</h2>
            </div>
            <RatingChart ratings={ratingDistribution} totalRatings={store.totalRatings} />
          </div>
        )}

        {/* Rating Form */}
        <div className="modern-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {store.userRating ? 'Update Your Rating' : 'Rate This Store'}
            </h2>
          </div>
          <form onSubmit={handleRatingSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Rating (1-5 stars)
              </label>
              <div className="flex space-x-2 justify-center p-4 bg-gray-50 rounded-lg">
                {renderStars(rating, true)}
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-sm text-gray-600">
                  You selected {rating} {rating === 1 ? 'star' : 'stars'}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment (optional)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="modern-input resize-none"
                placeholder="Share your experience with this store..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : store.userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Ratings */}
      {store.ratings && store.ratings.length > 0 && (
        <div className="modern-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Ratings</h2>
          </div>
          <div className="space-y-4">
            {store.ratings.slice(0, 5).map((rating, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {rating.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{rating.user.name}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(rating.rating)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-13 pl-1" style={{ marginLeft: '3.5rem' }}>{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreRating;
