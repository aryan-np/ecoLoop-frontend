import apiClient from "./client";

function unwrapResponse(response) {
	return response?.data?.Result || response?.Result || response?.data || response;
}

const analyticsAPI = {
	async getImpact() {
		const response = await apiClient("/api/analytics/impact/", {
			method: "GET",
		});

		return unwrapResponse(response);
	},

	async getUserImpact() {
		const response = await apiClient("/api/impact/user/", {
			method: "GET",
		});

		return unwrapResponse(response);
	},

	async getRecyclerImpact() {
		const response = await apiClient("/api/impact/recycler/", {
			method: "GET",
		});

		return unwrapResponse(response);
	},

	async getNgoImpact() {
		const response = await apiClient("/api/impact/ngo/", {
			method: "GET",
		});

		return unwrapResponse(response);
	},

	async getAdminImpact() {
		const response = await apiClient("/api/impact/admin/", {
			method: "GET",
		});

		return unwrapResponse(response);
	},

	async getCommunityImpact() {
		const response = await apiClient("/api/impact/community/", {
			method: "GET",
		});

		return unwrapResponse(response);
	},
};

export default analyticsAPI;
