import React from 'react';

interface RatingChartProps {
  ratings: { [key: number]: number }; // {1: count, 2: count, ...}
  totalRatings: number;
}

const RatingChart: React.FC<RatingChartProps> = ({ ratings, totalRatings }) => {
  const maxCount = Math.max(...Object.values(ratings), 1);

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = ratings[star] || 0;
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
        const barWidth = totalRatings > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={star} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 w-20">
              <span className="text-sm font-medium text-gray-700">{star}</span>
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-right">
              <span className="text-sm text-gray-600">{count}</span>
              <span className="text-xs text-gray-400 ml-1">({percentage.toFixed(0)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingChart;

