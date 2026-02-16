import apiClient from './client';

const adminAPI = {
  // Get all users with filters
  getUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.verified !== undefined && filters.verified !== '') params.append('verified', filters.verified);
      
      const queryString = params.toString();
      const url = `/api/auth/users/${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient(url);
      const data = response?.Result || response;
      
      // Handle paginated response
      if (data?.results && Array.isArray(data.results)) {
        return data.results;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user details by ID
  getUserDetails: async (userId) => {
    try {
      const response = await apiClient(`/api/auth/users/${userId}/`);
      return response?.Result || response;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  // Update user details
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient(`/api/auth/users/${userId}/`, {
        method: 'PUT',
        body: userData
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Partial update user (PATCH)
  partialUpdateUser: async (userId, userData) => {
    try {
      const response = await apiClient(`/api/auth/users/${userId}/`, {
        method: 'PATCH',
        body: userData
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Block/Unblock user
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await apiClient(`/api/auth/users/${userId}/`, {
        method: 'PATCH',
        body: { is_active: isActive }
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (userId, roleData) => {
    try {
      const response = await apiClient(`/api/auth/users/${userId}/`, {
        method: 'PATCH',
        body: { roles: roleData }
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Get stats for dashboard (placeholder - adjust based on your backend)
  getDashboardStats: async () => {
    try {
      const response = await apiClient('/api/admin/dashboard/stats/');
      return response?.Result || response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if endpoint doesn't exist yet
      return {
        total_users: 0,
        active_listings: 0,
        pending_reports: 0,
        total_transactions: 0
      };
    }
  }
};

export default adminAPI;
