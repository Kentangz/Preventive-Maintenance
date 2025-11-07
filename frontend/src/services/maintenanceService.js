import api from "../utils/api";

export const maintenanceService = {
    fetchAdminRecords: async (params = {}) => {
        const response = await api.get("/admin/maintenance-records", {
            params,
        });
        return response.data;
    },

    fetchPendingRecords: async (category) => {
        const response = await api.get(
            `/admin/maintenance-records/pending/${category}`
        );
        return response.data;
    },

    fetchRejectedRecords: async (category) => {
        const response = await api.get(
            `/admin/maintenance-records/rejected/${category}`
        );
        return response.data;
    },

    acceptRecord: async (recordId) => {
        const response = await api.post(
            `/admin/maintenance-records/${recordId}/accept`
        );
        return response.data;
    },

    rejectRecord: async (recordId) => {
        const response = await api.post(
            `/admin/maintenance-records/${recordId}/reject`
        );
        return response.data;
    },

    deleteRecord: async (recordId) => {
        const response = await api.delete(
            `/admin/maintenance-records/${recordId}`
        );
        return response.data;
    },

    previewRecordPdf: async (recordId) => {
        return api.get(`/maintenance-records/${recordId}/preview`, {
            responseType: "blob",
            headers: {
                Accept: "application/pdf",
            },
        });
    },

    downloadRecordPdf: async (recordId) => {
        return api.get(`/maintenance-records/${recordId}/pdf`, {
            responseType: "blob",
            headers: {
                Accept: "application/pdf",
            },
        });
    },

    submitMaintenanceRecord: async (formData) => {
        const response = await api.post("/employee/maintenance-records", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};

export default maintenanceService;
