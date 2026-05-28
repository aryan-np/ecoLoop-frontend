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
        
        // Handle new API response format with Result/result wrapper
        const data = response?.Result || response?.result || response;
        
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

  // Get scrap requests (for recyclers)
  getScrapRequests: async (filters = {}) => {
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.condition && filters.condition !== 'all') {
        params.append('condition', filters.condition);
      }
      if (filters.weight_range && filters.weight_range !== 'all') {
        params.append('weight_range', filters.weight_range);
      }
      
      const queryString = params.toString();
      const url = `/api/recycle/recycler/pending-requests/${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient(url);
      const data = response?.Result || response;
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error('Error fetching scrap requests:', error);
      throw error;
    }
  },

  // Recycler: Get saved scrap requests
  getRecyclerSavedRequests: async () => {
    try {
      const response = await apiClient('/api/recycle/recycler/saved-requests/');
      const data = response?.Result || response;
      const items = Array.isArray(data) ? data : data?.results || [];
      return items.map((item) => (
        item?.scrap_request
          ? { ...item.scrap_request, saved_id: item.id }
          : item
      ));
    } catch (error) {
      console.error('Error fetching recycler saved requests:', error);
      throw error;
    }
  },

  // Recycler: Save a pending scrap request
  saveRecyclerPendingRequest: async (id) => {
    try {
      const response = await apiClient(`/api/recycle/recycler/pending-requests/${id}/save/`, {
        method: 'POST'
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error saving recycler pending request:', error);
      throw error;
    }
  },

  // Recycler: Unsave a pending scrap request
  unsaveRecyclerPendingRequest: async (id) => {
    try {
      const response = await apiClient(`/api/recycle/recycler/pending-requests/${id}/save/`, {
        method: 'DELETE'
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error unsaving recycler pending request:', error);
      throw error;
    }
  },

  // Get single scrap request detail by ID
  getScrapRequestDetail: async (id) => {
    try {
      const response = await apiClient(`/api/recycle/recycler/pending-requests/${id}/`);
      return response?.Result || response;
    } catch (error) {
      console.error('Error fetching scrap request detail:', error);
      throw error;
    }
  },

  // Accept scrap request
  acceptScrapRequest: async (id, data) => {
    try {
      const response = await apiClient(`/api/recycle/recycler/pending-requests/${id}/accept/`, {
        method: 'POST',
        body: data
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error accepting scrap request:', error);
      throw error;
    }
  },

  // Get accepted requests (for pickup schedule)
  getAcceptedRequests: async () => {
    try {
      const response = await apiClient('/api/recycle/recycler/accepted-requests/');
      const data = response?.Result || response;
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error('Error fetching accepted requests:', error);
      throw error;
    }
  },

  // Get single accepted request detail by ID
  getAcceptedRequestDetail: async (id) => {
    try {
      const response = await apiClient(`/api/recycle/recycler/accepted-requests/${id}/`);
      return response?.Result || response;
    } catch (error) {
      console.error('Error fetching accepted request detail:', error);
      throw error;
    }
  },

  // Complete accepted pickup request
  completeAcceptedRequest: async (id, data = {}) => {
    try {
      const response = await apiClient(`/api/recycle/recycler/accepted-requests/${id}/complete/`, {
        method: 'POST',
        body: data,
      });
      return response?.Result || response;
    } catch (error) {
      console.error('Error completing accepted request:', error);
      throw error;
    }
  },

  // Get completed requests (for completed pickups)
  getCompletedRequests: async () => {
    try {
      const response = await apiClient('/api/recycle/recycler/completed-requests/');
      const data = response?.Result || response;
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error('Error fetching completed requests:', error);
      throw error;
    }
  },

  // Get single completed request detail by ID
  getCompletedRequestDetail: async (id) => {
    try {
      const response = await apiClient(`/api/recycle/recycler/completed-requests/${id}/`);
      return response?.Result || response;
    } catch (error) {
      console.error('Error fetching completed request detail:', error);
      throw error;
    }
  },
};

export default recycleAPI;
