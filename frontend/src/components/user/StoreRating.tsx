import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

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
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit rating');
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

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
        >
          ← Back to Store Directory
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{store.name}</h1>
        <p className="mt-1 text-sm text-gray-600">{store.address}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Store Information</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Owner:</span>
              <span className="ml-2 text-gray-600">{store.owner.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-600">{store.owner.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Overall Rating:</span>
              <div className="inline-flex items-center ml-2">
                {renderStars(Math.round(store.averageRating))}
                <span className="ml-2 text-gray-600">
                  {store.averageRating.toFixed(1)} ({store.totalRatings} ratings)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {store.userRating ? 'Update Your Rating' : 'Rate This Store'}
          </h2>
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex space-x-1">
                {renderStars(rating, true)}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Share your experience with this store..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : store.userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Ratings */}
      {store.ratings && store.ratings.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Ratings</h2>
          <div className="space-y-4">
            {store.ratings.slice(0, 5).map((rating, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{rating.user.name}</span>
                    <div className="flex">
                      {renderStars(rating.rating)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="mt-2 text-sm text-gray-600">{rating.comment}</p>
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
