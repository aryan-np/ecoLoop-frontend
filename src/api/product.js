import apiClient from "./client";

export const productAPI = {
  // Get all products with filters
  getProducts: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.price_min) params.append("price_min", filters.price_min);
    if (filters.price_max) params.append("price_max", filters.price_max);
    if (filters.category) params.append("category", filters.category);
    if (filters.condition) params.append("condition", filters.condition);
    if (filters.page) params.append("page", filters.page);
    
    const queryString = params.toString();
    const url = queryString ? `/api/product/products/?${queryString}` : "/api/product/products/";
    return apiClient(url, { method: "GET" });
  },

  // Get single product by ID
  getProductById: (id) => 
    apiClient(`/api/product/products/${id}/`, { method: "GET" }),

  // Create a new product
  createProduct: (formData) => 
    apiClient("/api/product/products/", { 
      method: "POST", 
      body: formData 
    }),

  // Update a product
  updateProduct: (id, formData) => 
    apiClient(`/api/product/products/${id}/`, { 
      method: "PUT", 
      body: formData 
    }),

  // Partial update of a product
  partialUpdateProduct: (id, data) => 
    apiClient(`/api/product/products/${id}/`, { 
      method: "PATCH", 
      body: data 
    }),

  // Delete a product
  deleteProduct: (id) => 
    apiClient(`/api/product/products/${id}/`, { method: "DELETE" }),

  // Get user's listings
  getListings: () => 
    apiClient("/api/product/listing/", { method: "GET" }),

  // Get product categories
  getCategories: () => 
    apiClient("/api/product/categories/", { method: "GET" }),

  // Get product conditions
  getConditions: () => 
    apiClient("/api/product/conditions/", { method: "GET" }),

  // Get specific user's listings
  getUserListings: (userId) => 
    apiClient(`/api/product/${userId}/products/`, { method: "GET" }),
};

export default productAPI;
