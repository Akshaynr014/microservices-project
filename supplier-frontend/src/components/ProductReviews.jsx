import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../services/api';

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    title: ''
  });
  const [averageRating, setAverageRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      // Fetch reviews for this product
      const response = await API.get(`/reviews/product/${productId}`);
      setReviews(response.data);
      
      // Calculate average rating
      if (response.data.length > 0) {
        const avg = response.data.reduce((sum, r) => sum + r.rating, 0) / response.data.length;
        setAverageRating(avg);
      }
      
      // Check if user has already reviewed
      const userReview = response.data.find(r => r.userId === user.id);
      setUserHasReviewed(!!userReview);
      
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      await API.post('/reviews', {
        productId: productId,
        userId: user.id,
        userName: user.name || user.email,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      });
      
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '', title: '' });
      fetchReviews();
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={`text-2xl ${!interactive && 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="mt-8 pt-8 border-t">
      {/* Reviews Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            {renderStars(Math.round(averageRating), false)}
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>
        </div>
        
        {!userHasReviewed && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            <h4 className="font-semibold text-gray-800 mb-3">Write Your Review</h4>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Summarize your experience"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                rows="3"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Share your experience with this product"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSubmitReview}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-b pb-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{review.userName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  {renderStars(review.rating, false)}
                  {review.title && (
                    <p className="font-medium text-gray-700 mt-1">{review.title}</p>
                  )}
                  <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                </div>
                {review.userId === user.id && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Your Review</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductReviews;