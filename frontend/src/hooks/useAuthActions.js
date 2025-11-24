import { useCallback } from "react";
import { authService } from "../services/authService";

export const useAuthActions = ({ setUser, setEmployee, authCheckedRef }) => {
    const setAuthType = useCallback((type) => {
        if (type) {
            localStorage.setItem("auth_type", type);
        }
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem("auth_type");
        setUser(null);
        setEmployee(null);
        authCheckedRef.current = false;
    }, [authCheckedRef, setEmployee, setUser]);

    const loginAdmin = useCallback(
        async (email, password) => {
            try {
                const data = await authService.adminLogin(email, password);
                if (data.success) {
                    setAuthType("admin");
                    setUser(data.user);
                    setEmployee(null);
                    return { success: true };
                }
                return {
                    success: false,
                    message: data.message || "Login failed",
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Login failed",
                };
            }
        },
        [setAuthType, setEmployee, setUser]
    );

    const authenticateEmployee = useCallback(
        async (name, identityPhoto) => {
            try {
                const data = await authService.employeeAuth(
                    name,
                    identityPhoto
                );

                if (data.success) {
                    setAuthType("employee");
                    setEmployee(data.employee);
                    setUser(null);
                    return { success: true };
                }
                return {
                    success: false,
                    message: data.message || "Authentication failed",
                };
            } catch (error) {
                return {
                    success: false,
                    message:
                        error.response?.data?.message ||
                        "Authentication failed",
                };
            }
        },
        [setAuthType, setEmployee, setUser]
    );

    const logoutAdmin = useCallback(async () => {
        try {
            await authService.adminLogout();
        } catch {
            // ignore
        } finally {
            clearSession();
        }
    }, [clearSession]);

    const logoutEmployee = useCallback(async () => {
        try {
            await authService.employeeLogout();
        } catch {
            // ignore
        } finally {
            clearSession();
        }
    }, [clearSession]);

    const updateAdmin = useCallback(
        async (profileData) => {
            try {
                const response = await authService.updateAdminProfile(
                    profileData
                );
                if (response.success) {
                    setUser(response.user);
                    return { success: true };
                }
                return {
                    success: false,
                    message: response.message || "Update failed",
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Update failed",
                };
            }
        },
        [setUser]
    );

    const updateEmployee = useCallback(
        async (profileData) => {
            try {
                const response = await authService.updateEmployeeProfile(
                    profileData
                );
                if (response.success) {
                    setEmployee(response.employee);
                    return { success: true };
                }
                return {
                    success: false,
                    message: response.message || "Update failed",
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Update failed",
                };
            }
        },
        [setEmployee]
    );

    return {
        loginAdmin,
        authenticateEmployee,
        logoutAdmin,
        logoutEmployee,
        updateAdmin,
        updateEmployee,
    };
};
