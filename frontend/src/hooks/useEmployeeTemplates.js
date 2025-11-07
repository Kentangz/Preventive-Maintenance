import { useCallback, useEffect, useState } from "react";
import { templateService } from "../services/templateService";

export const useEmployeeTemplates = (category) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTemplates = useCallback(async () => {
        if (!category) return;

        setLoading(true);
        try {
            const response = await templateService.fetchEmployeeTemplates(
                category
            );
            if (response.success) {
                setTemplates(response.data);
                setError("");
            } else {
                setError(response.message || "Gagal memuat templates");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Gagal memuat templates");
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        templates,
        loading,
        error,
        refresh: fetchTemplates,
    };
};

export default useEmployeeTemplates;
