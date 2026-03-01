import { useState } from 'react';

const Settings = () => {
  const [securitySettings, setSecuritySettings] = useState({
    requireConfirmation: true,
    autoFlagReports: true,
    rateLimitReporting: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    highSeverityAlerts: true
  });

  const toggleSecurity = (key) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleNotification = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure admin panel security and system preferences</p>
      </div>

      <div className="space-y-6">
        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
          </div>

          <div className="space-y-4">
            {/* Require Confirmation */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Require confirmation for critical actions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Show confirmation dialog before blocking users, removing listings, or rejecting verifications
                </p>
              </div>
              <button
                onClick={() => toggleSecurity('requireConfirmation')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.requireConfirmation ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.requireConfirmation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto-flag Reports */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Auto-flag repeated reports</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically escalates reports from the same user or about the same target entity
                </p>
              </div>
              <button
                onClick={() => toggleSecurity('autoFlagReports')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.autoFlagReports ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.autoFlagReports ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Rate Limit Reporting */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Rate limit repeated reporting</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Prevent spam by limiting the number of reports a user can submit per day (max 5)
                </p>
              </div>
              <button
                onClick={() => toggleSecurity('rateLimitReporting')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.rateLimitReporting ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.rateLimitReporting ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-teal-900">
                <strong>Security Notice:</strong> Admin actions are logged and require authorization. All high-risk operations are monitored for compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Email notifications</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Receive email alerts for new disputes, pending verifications, and system issues
                </p>
              </div>
              <button
                onClick={() => toggleNotification('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* High Severity Alerts */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">High severity alerts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get immediate notifications for high-severity reports and critical system events
                </p>
              </div>
              <button
                onClick={() => toggleNotification('highSeverityAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.highSeverityAlerts ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.highSeverityAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Performance Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Performance Information</h2>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">System Performance:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>System optimized for reliable performance under expected load</li>
                  <li>Average response time: &lt;200ms for admin operations</li>
                  <li>Database queries optimized with proper indexing</li>
                  <li>Caching enabled for frequently accessed data</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Database Size</p>
              <p className="text-2xl font-bold text-gray-900">1245 MB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.8%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
