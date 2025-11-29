import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const CardSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`modern-card p-6 animate-pulse ${className}`}>
    <div className="flex items-start space-x-4">
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export const StoreCardSkeleton: React.FC = () => (
  <div className="modern-card p-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="modern-card p-6 animate-pulse">
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

interface LoadingSkeletonProps {
  type?: 'card' | 'store' | 'table' | 'page';
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', className = '' }) => {
  switch (type) {
    case 'page':
      return (
        <div className={`text-center ${className}`}>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      );
    case 'store':
      return <StoreCardSkeleton />;
    case 'table':
      return <TableSkeleton />;
    default:
      return <CardSkeleton className={className} />;
  }
};

export default LoadingSkeleton;

