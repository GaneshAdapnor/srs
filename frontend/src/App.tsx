import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AdminDashboard from './components/admin/AdminDashboard';
import StoresList from './components/admin/StoresList';
import UsersList from './components/admin/UsersList';
import CreateUser from './components/admin/CreateUser';
import UserDashboard from './components/user/UserDashboard';
import StoreRating from './components/user/StoreRating';
import StoreOwnerDashboard from './components/store-owner/StoreOwnerDashboard';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                {user?.role === 'admin' && <AdminDashboard />}
                {user?.role === 'user' && <UserDashboard />}
                {user?.role === 'store_owner' && <StoreOwnerDashboard />}
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
                <StoresList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <UsersList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-user"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <CreateUser />
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
                <StoreRating />
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
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900">Store Ratings</h1>
                  <p className="mt-2 text-gray-600">Detailed ratings view coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full space-y-8 text-center">
                <div>
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Access Denied
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    You don't have permission to access this page.
                  </p>
                </div>
                <div>
                  <a
                    href="/dashboard"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Go to Dashboard
                  </a>
                </div>
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full space-y-8 text-center">
                <div>
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Page Not Found
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
                <div>
                  <a
                    href="/dashboard"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
