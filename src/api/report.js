import apiClient from "./client";

const reportAPI = {
  /**
   * Submit a new report
   * @param {Object} data - Report data { category, subject, description, listing_id, target_user_id, conversation_id, attachment }
   * @returns {Promise}
   */
  async submitReport(data) {
    // If there's an attachment, use FormData
    if (data.attachment && data.attachment instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      return await apiClient("/api/auth/reports/", {
        method: "POST",
        body: formData,
      });
    }

    // Otherwise use JSON
    return await apiClient("/api/auth/reports/", {
      method: "POST",
      body: data,
    });
  },

  /**
   * Get all reports (admin only)
   * @returns {Promise}
   */
  async getReports() {
    return await apiClient("/api/auth/admin/reports/", {
      method: "GET",
    });
  },

  /**
   * Get reports for the current user
   * @returns {Promise}
   */
  async getMyReports() {
    return await apiClient("/api/auth/reports/", {
      method: "GET",
    });
  },

  /**
   * Get a specific report by ID
   * @param {number} id - Report ID
   * @returns {Promise}
   */
  async getReportById(id) {
    return await apiClient(`/api/auth/admin/reports/${id}/`, {
      method: "GET",
    });
  },

  /**
   * Get a specific report by ID for the current user
   * @param {number} id - Report ID
   * @returns {Promise}
   */
  async getMyReportById(id) {
    return await apiClient(`/api/auth/reports/${id}/`, {
      method: "GET",
    });
  },
};

export default reportAPI;
