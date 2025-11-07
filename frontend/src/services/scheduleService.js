import api from "../utils/api";

export const scheduleService = {
    list: async () => {
        const response = await api.get("/admin/schedules");
        return response.data;
    },

    create: async (formData) => {
        const response = await api.post("/admin/schedules", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    update: async (id, formData) => {
        const payload = new FormData();
        for (const [key, value] of formData.entries()) {
            payload.append(key, value);
        }
        payload.append("_method", "PUT");

        const response = await api.post(`/admin/schedules/${id}`, payload, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    remove: async (id) => {
        const response = await api.delete(`/admin/schedules/${id}`);
        return response.data;
    },

    download: async (id) => {
        return api.get(`/admin/schedules/${id}/download`, {
            responseType: "blob",
        });
    },
};

export default scheduleService;
