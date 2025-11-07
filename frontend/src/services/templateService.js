import api from "../utils/api";

export const templateService = {
    fetchAdminTemplates: async () => {
        const response = await api.get("/admin/checklist-templates");
        return response.data;
    },

    createTemplate: async (payload) => {
        const response = await api.post("/admin/checklist-templates", payload);
        return response.data;
    },

    updateTemplate: async (id, payload) => {
        const response = await api.put(
            `/admin/checklist-templates/${id}`,
            payload
        );
        return response.data;
    },

    deleteTemplate: async (id) => {
        const response = await api.delete(`/admin/checklist-templates/${id}`);
        return response.data;
    },

    duplicateTemplate: async (id) => {
        const response = await api.post(
            `/admin/checklist-templates/${id}/duplicate`
        );
        return response.data;
    },

    previewTemplatePdf: async (payload) => {
        return api.post("/admin/checklist-templates/preview-pdf", payload, {
            responseType: "blob",
        });
    },

    fetchEmployeeTemplates: async (category) => {
        const response = await api.get(
            `/employee/checklist-templates/${category}`
        );
        return response.data;
    },
};

export default templateService;
