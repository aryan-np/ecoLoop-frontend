import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import Toast from '../../components/Toast';
import Spinner from '../../components/Spinner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters client-side for instant feedback
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = user.full_name?.toLowerCase().includes(searchLower);
      const matchesEmail = user.email?.toLowerCase().includes(searchLower);
      const matchesPhone = user.phone_number?.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesEmail && !matchesPhone) {
        return false;
      }
    }

    // Role filter
    if (filters.role) {
      const userRoles = user.roles || [];
      const hasRole = userRoles.some(role => 
        role.name && role.name.toUpperCase() === filters.role.toUpperCase()
      );
      if (!hasRole) {
        return false;
      }
    }

    // Status filter
    if (filters.status) {
      const isActive = user.is_active !== false;
      if (filters.status === 'active' && !isActive) return false;
      if (filters.status === 'blocked' && isActive) return false;
    }

    return true;
  });

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleBlockUser = async () => {
    if (!confirmBlock) return;
    
    const { userId, currentStatus } = confirmBlock;
    const newStatus = !currentStatus; // Toggle status
    const action = newStatus ? 'activated' : 'blocked';
    
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      setToast({ type: 'success', message: `User ${action} successfully` });
      
      // Update user in state instead of reloading to preserve scroll position
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_active: newStatus } : user
        )
      );
    } catch (error) {
      setToast({ type: 'error', message: `Failed to update user status` });
    } finally {
      setConfirmBlock(null);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      setViewLoading(true);
      setShowViewModal(true);
      const userDetails = await adminAPI.getUserDetails(userId);
      setSelectedUser(userDetails);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load user details' });
      setShowViewModal(false);
    } finally {
      setViewLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      USER: 'bg-blue-100 text-blue-700',
      ADMIN: 'bg-purple-100 text-purple-700',
      NGO: 'bg-green-100 text-green-700',
      Recycler: 'bg-teal-100 text-teal-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (index) => {
    const colors = ['bg-teal-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-pink-200'];
    return colors[index % colors.length];
  };

  const getTotalListings = (listing) => {
    if (!listing) return 0;
    return (listing.products_count || 0) + (listing.donations_count || 0) + (listing.recycles_count || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage platform users and their permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="Recycler">Recycler</option>
            <option value="NGO">NGO</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        
        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Listings</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  {users.length === 0 ? 'No users found' : 'No users match the selected filters'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(
                          index
                        )}`}
                      >
                        <span className="font-semibold text-gray-700">
                          {getInitials(user.full_name)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-gray-500">{user.phone_number || 'N/A'}</div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role.id}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              role.name
                            )}`}
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          USER
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Listings */}
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <span className="text-gray-700 cursor-help">
                        {getTotalListings(user.listing)}
                      </span>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>Products: {user.listing?.products_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>Recycles: {user.listing?.recycles_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                              </svg>
                              <span>Donations: {user.listing?.donations_count || 0}</span>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-4 -mt-1">
                            <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.is_active !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.is_active !== false ? 'Active' : 'Blocked'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => viewUserDetails(user.id)}
                        className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setConfirmBlock({ userId: user.id, currentStatus: user.is_active !== false, userName: user.full_name })}
                        className={`text-sm font-medium ${
                          user.is_active !== false
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {user.is_active !== false ? 'Block' : 'Unblock'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* View User Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {viewLoading ? (
              <div className="p-12 flex items-center justify-center">
                <Spinner />
              </div>
            ) : selectedUser ? (
              <>
                {/* Header */}
                <div className="bg-teal-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
                  <h3 className="text-xl font-bold">User Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Full Name</label>
                        <p className="text-gray-900 font-medium">{selectedUser.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">User ID</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedUser.id}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Phone Number</label>
                        <p className="text-gray-900">{selectedUser.phone_number || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Verification Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Email Verified:</label>
                        {selectedUser.is_email_verified ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">No</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Phone Verified:</label>
                        {selectedUser.is_phone_verified ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">No</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roles */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Roles</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedUser.roles && selectedUser.roles.length > 0 ? (
                        selectedUser.roles.map((role) => (
                          <span
                            key={role.id}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(role.name)}`}
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No roles assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Listings */}
                  {selectedUser.listing && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Listings</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="flex justify-center mb-2">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{selectedUser.listing.products_count || 0}</p>
                          <p className="text-sm text-blue-700">Products</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-4 text-center">
                          <div className="flex justify-center mb-2">
                            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <p className="text-2xl font-bold text-teal-900">{selectedUser.listing.recycles_count || 0}</p>
                          <p className="text-sm text-teal-700">Recycles</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <div className="flex justify-center mb-2">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{selectedUser.listing.donations_count || 0}</p>
                          <p className="text-sm text-purple-700">Donations</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Account Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Status</label>
                        <p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedUser.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {selectedUser.is_active !== false ? 'Active' : 'Blocked'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Date Joined</label>
                        <p className="text-gray-900">
                          {selectedUser.date_joined ? new Date(selectedUser.date_joined).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                {confirmBlock.currentStatus ? 'Block User' : 'Unblock User'}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to {confirmBlock.currentStatus ? 'block' : 'unblock'} <span className="font-semibold">{confirmBlock.userName}</span>?
                {confirmBlock.currentStatus && ' They will no longer be able to access the platform.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmBlock(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    confirmBlock.currentStatus
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {confirmBlock.currentStatus ? 'Block' : 'Unblock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
