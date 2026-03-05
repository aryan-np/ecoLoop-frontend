import apiClient from "./client";

const donationAPI = {
  // Get all donation categories with pagination
  getCategories: async (page = 1) => {
    try {
      return await apiClient(`/api/donations/categories/?page=${page}`);
    } catch (error) {
      console.error('Error fetching donation categories:', error);
      throw error;
    }
  },

  // Get all categories (fetch all pages)
  getAllCategories: async () => {
    try {
      let allCategories = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiClient(`/api/donations/categories/?page=${page}`);
        
        // Handle new API response format with Result wrapper
        const data = response?.Result || response;
        
        // Handle response - check if it has results array
        if (data && Array.isArray(data.results)) {
          allCategories = [...allCategories, ...data.results];
          hasMore = data.next !== null && data.next !== undefined;
          page++;
        } else if (Array.isArray(data)) {
          // If response is directly an array
          allCategories = data;
          hasMore = false;
        } else {
          hasMore = false;
        }
      }

      return allCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get all donation conditions with pagination
  getConditions: async (page = 1) => {
    try {
      return await apiClient(`/api/donations/conditions/?page=${page}`);
    } catch (error) {
      console.error('Error fetching donation conditions:', error);
      throw error;
    }
  },

  // Get all conditions (fetch all pages)
  getAllConditions: async () => {
    try {
      let allConditions = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiClient(`/api/donations/conditions/?page=${page}`);
        
        // Handle new API response format with Result wrapper
        const data = response?.Result || response;
        
        // Handle response - check if it has results array
        if (data && Array.isArray(data.results)) {
          allConditions = [...allConditions, ...data.results];
          hasMore = data.next !== null && data.next !== undefined;
          page++;
        } else if (Array.isArray(data)) {
          // If response is directly an array
          allConditions = data;
          hasMore = false;
        } else {
          hasMore = false;
        }
      }

      return allConditions;
    } catch (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }
  },

  // Submit donation request
  submitDonation: async (data) => {
    return apiClient('/api/donations/requests/', {
      method: 'POST',
      body: data
    });
  },

  // NGO: Get pending donation requests
  getNGOPendingRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.condition && filters.condition !== 'all') {
        params.append('condition', filters.condition);
      }
      
      const queryString = params.toString();
      const url = `/api/donations/ngo/pending-requests/${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient(url);
      const data = response?.Result || response;
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error('Error fetching NGO pending requests:', error);
      throw error;
    }
  },

  // NGO: Get single donation request detail by ID
  getNGORequestDetail: async (id) => {
    try {
      const response = await apiClient(`/api/donations/ngo/pending-requests/${id}/`);
      return response?.Result || response;
    } catch (error) {
      console.error('Error fetching donation request detail:', error);
      throw error;
    }
  },

  // NGO: Accept donation request
  acceptDonationRequest: async (id, data) => {
    try {
      const response = await apiClient(`/api/donations/ngo/pending-requests/${id}/accept/`, {
        method: 'POST',
        body: data
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error accepting donation request:', error);
      throw error;
    }
  },

  // NGO: Get accepted requests (for scheduled donations)
  getNGOAcceptedRequests: async () => {
    try {
      const response = await apiClient('/api/donations/ngo/accepted-requests/');
      const data = response?.Result || response;
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error('Error fetching accepted donation requests:', error);
      throw error;
    }
  },
};

export default donationAPI;
