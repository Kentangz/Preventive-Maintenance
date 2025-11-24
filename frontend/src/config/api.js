export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    storageURL: import.meta.env.VITE_STORAGE_BASE_URL,
    timeout: import.meta.env.VITE_API_TIMEOUT,
};

export const API_ENDPOINTS = {
    auth: {
        adminLogin: "/admin/login",
        adminMe: "/admin/me",
        adminLogout: "/admin/logout",
        employeeAuth: "/employee/auth",
        employeeMe: "/employee/me",
        employeeLogout: "/employee/logout",
        updateProfile: "/update-profile",
        updatePassword: "/update-password",
    },
    maintenance: {
        records: "/maintenance-records",
        templates: "/checklist-templates",
        approve: "/maintenance-records/:id/approve",
        reject: "/maintenance-records/:id/reject",
    },
    schedules: {
        list: "/schedules",
        create: "/schedules",
        update: "/schedules/:id",
        delete: "/schedules/:id",
    },
};
