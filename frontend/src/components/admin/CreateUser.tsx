import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface CreateUserFormData {
  name: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface ValidationState {
  name: { isValid: boolean; message: string };
  email: { isValid: boolean; message: string };
  address: { isValid: boolean; message: string };
  password: { isValid: boolean; message: string };
  confirmPassword: { isValid: boolean; message: string };
}

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    name: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    address: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' }
  });

  // Real-time validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return { isValid: false, message: 'Name is required' };
    } else if (name.length < 20) {
      return { isValid: false, message: `Name must be at least 20 characters (${name.length}/20)` };
    } else if (name.length > 60) {
      return { isValid: false, message: `Name must not exceed 60 characters (${name.length}/60)` };
    }
    return { isValid: true, message: 'Name looks good!' };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return { isValid: false, message: 'Email is required' };
    } else if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: 'Email format is valid' };
  };

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      return { isValid: false, message: 'Address is required' };
    } else if (address.length > 400) {
      return { isValid: false, message: `Address must not exceed 400 characters (${address.length}/400)` };
    }
    return { isValid: true, message: 'Address looks good!' };
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    } else if (password.length < 8) {
      return { isValid: false, message: `Password must be at least 8 characters (${password.length}/8)` };
    } else if (password.length > 16) {
      return { isValid: false, message: `Password must not exceed 16 characters (${password.length}/16)` };
    } else if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    return { isValid: true, message: 'Password meets all requirements!' };
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      return { isValid: false, message: 'Please confirm your password' };
    } else if (confirmPassword !== password) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: 'Passwords match!' };
  };

  // Real-time validation effect
  useEffect(() => {
    setValidationState({
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      address: validateAddress(formData.address),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    });
  }, [formData]);

  const isFormValid = (): boolean => {
    return Object.values(validationState).every(field => field.isValid);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any existing error messages
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fix all validation errors before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { confirmPassword, ...userData } = formData;
      const response = await api.post('/admin/users', userData);
      setCreatedUser(response.data.user);
      setSuccess(true);
      
      // Reset form after successful creation
      setFormData({
        name: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setCreatedUser(null);
      }, 5000);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = err.response.data.errors;
        setError(`Validation failed: ${Object.values(serverErrors).join(', ')}`);
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access - can manage users, stores, and all data';
      case 'store_owner':
        return 'Can manage their own stores and view ratings';
      case 'user':
        return 'Can browse stores, submit ratings, and manage their profile';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New User</h2>
          <p className="text-gray-600">Add a new user to the system with appropriate role and permissions</p>
        </div>

        {success && createdUser && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">User Created Successfully!</h3>
                <div className="bg-white p-4 rounded-lg border border-green-200 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-900">{createdUser.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{createdUser.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Role:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {createdUser.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">User ID:</span>
                      <span className="ml-2 text-gray-900">#{createdUser.id}</span>
                    </div>
                  </div>
                </div>
                <p className="text-green-700 text-sm">
                  The new user has been added to the system and can now log in with their credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-400 text-xl mr-3">❌</div>
              <div>
                <h3 className="text-red-800 font-medium">Error Creating User</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationState.name.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : formData.name.length > 0 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                }`}
                placeholder="Enter full name (20-60 characters)"
              />
              {formData.name.length > 0 && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {validationState.name.isValid ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className={`text-sm ${validationState.name.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validationState.name.message}
              </p>
              <p className="text-xs text-gray-500">
                {formData.name.length}/60
              </p>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationState.email.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : formData.email.length > 0 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {formData.email.length > 0 && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {validationState.email.isValid ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <p className={`mt-1 text-sm ${validationState.email.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {validationState.email.message}
            </p>
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <div className="relative">
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                  validationState.address.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : formData.address.length > 0 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                }`}
                placeholder="Enter complete address"
              />
              {formData.address.length > 0 && (
                <div className="absolute top-3 right-3">
                  {validationState.address.isValid ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className={`text-sm ${validationState.address.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validationState.address.message}
              </p>
              <p className="text-xs text-gray-500">
                {formData.address.length}/400
              </p>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationState.password.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : formData.password.length > 0 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                }`}
                placeholder="Enter password (8-16 characters)"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 mr-2"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {formData.password.length > 0 && (
                  <div>
                    {validationState.password.isValid ? (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <p className={`text-sm ${validationState.password.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validationState.password.message}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center ${formData.password.length >= 8 && formData.password.length <= 16 ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{formData.password.length >= 8 && formData.password.length <= 16 ? '✓' : '○'}</span>
                    8-16 characters ({formData.password.length}/16)
                  </li>
                  <li className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{/(?=.*[A-Z])/.test(formData.password) ? '✓' : '○'}</span>
                    At least one uppercase letter
                  </li>
                  <li className={`flex items-center ${/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password) ? '✓' : '○'}</span>
                    At least one special character
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationState.confirmPassword.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : formData.confirmPassword.length > 0 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 mr-2"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {formData.confirmPassword.length > 0 && (
                  <div>
                    {validationState.confirmPassword.isValid ? (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className={`mt-1 text-sm ${validationState.confirmPassword.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {validationState.confirmPassword.message}
            </p>
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              User Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="user">👤 Normal User</option>
              <option value="store_owner">🏪 Store Owner</option>
              <option value="admin">👑 System Administrator</option>
            </select>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Role Description:</p>
              <p className="text-xs text-blue-700">{getRoleDescription(formData.role)}</p>
            </div>
          </div>

          {/* Form Validation Summary */}
          {!isFormValid() && (formData.name || formData.email || formData.address || formData.password) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Please fix the following issues:</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {!validationState.name.isValid && formData.name.length > 0 && (
                        <li>Name: {validationState.name.message}</li>
                      )}
                      {!validationState.email.isValid && formData.email.length > 0 && (
                        <li>Email: {validationState.email.message}</li>
                      )}
                      {!validationState.address.isValid && formData.address.length > 0 && (
                        <li>Address: {validationState.address.message}</li>
                      )}
                      {!validationState.password.isValid && formData.password.length > 0 && (
                        <li>Password: {validationState.password.message}</li>
                      )}
                      {!validationState.confirmPassword.isValid && formData.confirmPassword.length > 0 && (
                        <li>Confirm Password: {validationState.confirmPassword.message}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  address: '',
                  password: '',
                  confirmPassword: '',
                  role: 'user'
                });
                setError(null);
                setSuccess(false);
                setCreatedUser(null);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Form</span>
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                isFormValid() && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {!loading && isFormValid() && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              <span>{loading ? 'Creating User...' : isFormValid() ? 'Create User' : 'Fix Validation Errors'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
