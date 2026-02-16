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
};

export default donationAPI;
