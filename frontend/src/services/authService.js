import api from "../utils/api";

export const authService = {
    adminLogin: async (email, password) => {
        const response = await api.post("/admin/login", { email, password });
        return response.data;
    },

    employeeAuth: async (name, identityPhoto) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("identity_photo", identityPhoto);

        const response = await api.post("/employee/auth", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    adminLogout: () => api.post("/admin/logout"),
    employeeLogout: () => api.post("/employee/logout"),

    updateAdminProfile: async (payload) => {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("email", payload.email);
        if (payload.signature) {
            formData.append("signature", payload.signature);
        }
        formData.append("_method", "PATCH");

        const response = await api.post("/admin/profile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    updateEmployeeProfile: async (payload) => {
        const formData = new FormData();
        formData.append("name", payload.name);
        if (payload.signature) {
            formData.append("signature", payload.signature);
        }
        formData.append("_method", "PATCH");

        const response = await api.post("/employee/profile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },
};

export default authService;
