import apiClient from "./client";

const paymentAPI = {
  initiate: (payload) =>
    apiClient("/api/payments/initiate/", { method: "POST", body: payload }),

  verify: (pidx) =>
    apiClient("/api/payments/verify/", { method: "POST", body: { pidx } }),

  list: (page = 1) =>
    apiClient(`/api/payments/?page=${page}`),

  getById: (id) =>
    apiClient(`/api/payments/${id}/`),
};

export default paymentAPI;
