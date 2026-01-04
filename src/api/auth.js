import apiClient from "./client";

export const authAPI = {
  login: (email, method) => 
    apiClient("/api/auth/login/", { 
      method: "POST", 
      body: { email, method } 
    }),

  loginWithPassword: (email, password) => 
    apiClient("/api/auth/login/", { 
      method: "POST", 
      body: { email, password, method: "PASSWORD" } 
    }),

  register: (email, full_name, phone_number, password, confirm_password) => 
    apiClient("/api/auth/register/", { 
      method: "POST", 
      body: { email, full_name, phone_number, password, confirm_password } 
    }),

  verifyOTP: (email, otp, purpose, registration_id) => 
    apiClient("/api/auth/verify-otp/", { 
      method: "POST", 
      body: { email, otp, purpose, registration_id } 
    }),

  logout: (refresh) => 
    apiClient("/api/auth/logout/", { 
      method: "POST", 
      body: { refresh } 
    }),

  getUserProfile: () => 
    apiClient("/api/auth/user-profile/", { method: "GET" }),

  updateUserProfile: (data) => 
    apiClient("/api/auth/user-profile/", { 
      method: "PUT", 
      body: data 
    }),

  partialUpdateUserProfile: (data) => 
    apiClient("/api/auth/user-profile/", { 
      method: "PATCH", 
      body: data 
    }),
};

export default authAPI;
