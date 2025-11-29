import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import Layout from './components/Layout';

// Lazy load components for better performance
const Login = lazy(() => import('./components/auth/Login'));
const Signup = lazy(() => import('./components/auth/Signup'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const StoresList = lazy(() => import('./components/admin/StoresList'));
const UsersList = lazy(() => import('./components/admin/UsersList'));
const CreateUser = lazy(() => import('./components/admin/CreateUser'));
const UserDashboard = lazy(() => import('./components/user/UserDashboard'));
const StoreRating = lazy(() => import('./components/user/StoreRating'));
const StoreOwnerDashboard = lazy(() => import('./components/store-owner/StoreOwnerDashboard'));

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <LoadingSkeleton type="page" />
        </div>
      }
    >
      {children}
    </Suspense>
  );

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <SuspenseWrapper>
                <Login />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/signup"
            element={
              <SuspenseWrapper>
                <Signup />
              </SuspenseWrapper>
            }
          />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <SuspenseWrapper>
                    {user?.role === 'admin' && <AdminDashboard />}
                    {user?.role === 'user' && <UserDashboard />}
                    {user?.role === 'store_owner' && <StoreOwnerDashboard />}
                  </SuspenseWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <SuspenseWrapper>
                    <StoresList />
                  </SuspenseWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <SuspenseWrapper>
                    <UsersList />
                  </SuspenseWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-user"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <SuspenseWrapper>
                    <CreateUser />
                  </SuspenseWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* User Routes */}
          <Route
            path="/user/stores/:id"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <SuspenseWrapper>
                    <StoreRating />
                  </SuspenseWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Store Owner Routes */}
          <Route
            path="/store-owner/stores/:id/ratings"
            element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <Layout>
                  <SuspenseWrapper>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Store Ratings</h1>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Detailed ratings view coming soon...</p>
                    </div>
                  </SuspenseWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md w-full modern-card p-8 space-y-6 text-center animate-fade-in">
                  <div className="mx-auto h-16 w-16 bg-gradient-error rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Access Denied
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You don't have permission to access this page.
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="btn-primary w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            }
          />
          
          {/* Default redirect */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            }
          />
          
          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md w-full modern-card p-8 space-y-6 text-center animate-fade-in">
                  <div className="mx-auto h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Page Not Found
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="btn-primary w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
