import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import UpdatePassword from './auth/UpdatePassword';
import api from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'about'>('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Note: You may need to create an API endpoint for updating profile
      // For now, we'll show a message
      showSuccess('Profile update feature coming soon!');
      setIsEditingProfile(false);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      showSuccess('Data export feature coming soon!');
    } catch (error: any) {
      showError('Failed to export data');
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'user':
        return 'Normal User';
      case 'store_owner':
        return 'Store Owner';
      default:
        return role;
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-700">
                        <span className="text-white text-2xl font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{getRoleDisplayName(user?.role || '')}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Account ID: #{user?.id}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="modern-input w-full"
                            disabled
                          />
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-900 dark:text-gray-100">
                            {user?.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-900 dark:text-gray-100">
                          {user?.email}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address
                        </label>
                        {isEditingProfile ? (
                          <textarea
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            className="modern-input w-full"
                            rows={3}
                            disabled
                          />
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-900 dark:text-gray-100">
                            {user?.address}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      {isEditingProfile ? (
                        <>
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="btn-primary"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="btn-secondary"
                          disabled
                        >
                          Edit Profile (Coming Soon)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Active</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Account Status</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user?.role === 'user' ? '0' : 'N/A'}</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Ratings Given</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user?.role === 'store_owner' ? '0' : 'N/A'}</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Stores Owned</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Change Password</h4>
                      <UpdatePassword />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Session Management</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Current Session</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Active now</div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Data Management</h4>
                      <div className="space-y-3">
                        <button
                          onClick={handleExportData}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">📥</span>
                            <div className="text-left">
                              <div className="font-medium text-gray-900 dark:text-gray-100">Export My Data</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Download your account data</div>
                            </div>
                          </div>
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Preferences</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appearance</h4>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{isDark ? '🌙' : '☀️'}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Theme</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Current: {isDark ? 'Dark Mode' : 'Light Mode'}</div>
                          </div>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="btn-secondary"
                        >
                          Switch to {isDark ? 'Light' : 'Dark'} Mode
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Rating Reminders</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Get reminded to rate stores</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h3>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900 dark:to-purple-900 rounded-lg">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="h-16 w-16 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" style={{ stroke: '#ffffff', strokeWidth: '2.5', fill: 'none' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" style={{ stroke: '#ffffff' }} />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Store Rating System</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Version 1.0.0</p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        A comprehensive platform for managing stores and collecting customer ratings. 
                        Built with React, Express, and modern web technologies.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">System Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">User ID</span>
                          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">#{user?.id}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">Account Type</span>
                          <span className="text-gray-900 dark:text-gray-100">{getRoleDisplayName(user?.role || '')}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                            {user?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Quick Links</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <a href="#" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center">
                          <div className="text-2xl mb-2">📚</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Documentation</div>
                        </a>
                        <a href="#" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center">
                          <div className="text-2xl mb-2">💬</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Support</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

