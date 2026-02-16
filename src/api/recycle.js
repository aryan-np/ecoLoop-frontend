import apiClient from "./client";

const recycleAPI = {
  // Get all recycle rates with pagination
  getRates: async (page = 1) => {
    try {
      return await apiClient(`/api/recycle/categories/?page=${page}`);
    } catch (error) {
      console.error('Error fetching rates page:', error);
      throw error;
    }
  },

  // Get all rates (fetch all pages)
  getAllRates: async () => {
    try {
      let allRates = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiClient(`/api/recycle/categories/?page=${page}`);
        
        // Handle new API response format with Result wrapper
        const data = response?.Result || response;
        
        // Handle response - check if it has results array
        if (data && Array.isArray(data.results)) {
          allRates = [...allRates, ...data.results];
          hasMore = data.next !== null && data.next !== undefined;
          page++;
        } else if (Array.isArray(data)) {
          // If response is directly an array
          allRates = data;
          hasMore = false;
        } else {
          hasMore = false;
        }
      }

      return allRates;
    } catch (error) {
      console.error('Error fetching rates:', error);
      throw error;
    }
  },

  // Get all categories for the form (same as rates but different endpoint name for clarity)
  getCategories: async () => {
    try {
      let allCategories = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiClient(`/api/recycle/categories/?page=${page}`);
        
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

  // Submit scrap request
  submitScrapRequest: async (data) => {
    return apiClient('/api/recycle/scrap-requests/', {
      method: 'POST',
      body: data
    });
  },
};

export default recycleAPI;
