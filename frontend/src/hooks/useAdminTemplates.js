import { useCallback, useEffect, useState } from "react";
import { templateService } from "../services/templateService";

const getErrorMessage = (error, fallback) => {
    return error?.response?.data?.message || fallback;
};

export const useAdminTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const data = await templateService.fetchAdminTemplates();
            if (data.success) {
                setTemplates(data.data);
                setError("");
            } else {
                setError(data.message || "Failed to load templates");
            }
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load templates"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const deleteTemplate = useCallback(async (id) => {
        try {
            const response = await templateService.deleteTemplate(id);
            if (response.success) {
                setTemplates((prev) =>
                    prev.filter((template) => template.id !== id)
                );
                return { success: true };
            }
            return {
                success: false,
                message: response.message || "Failed to delete template",
            };
        } catch (err) {
            return {
                success: false,
                message: getErrorMessage(err, "Failed to delete template"),
            };
        }
    }, []);

    const duplicateTemplate = useCallback(
        async (templateId) => {
            try {
                const response = await templateService.duplicateTemplate(
                    templateId
                );
                if (response.success) {
                    await fetchTemplates();
                    return { success: true };
                }
                return {
                    success: false,
                    message: response.message || "Failed to duplicate template",
                };
            } catch (err) {
                return {
                    success: false,
                    message: getErrorMessage(
                        err,
                        "Failed to duplicate template"
                    ),
                };
            }
        },
        [fetchTemplates]
    );

    const upsertTemplate = useCallback(
        async (payload, templateId) => {
            try {
                const response = templateId
                    ? await templateService.updateTemplate(templateId, payload)
                    : await templateService.createTemplate(payload);

                if (response.success) {
                    await fetchTemplates();
                    return { success: true, message: response.message };
                }

                return {
                    success: false,
                    message: response.message || "Failed to save template",
                };
            } catch (err) {
                return {
                    success: false,
                    message: getErrorMessage(err, "Failed to save template"),
                };
            }
        },
        [fetchTemplates]
    );

    return {
        templates,
        loading,
        error,
        setError,
        fetchTemplates,
        deleteTemplate,
        duplicateTemplate,
        upsertTemplate,
    };
};

export default useAdminTemplates;
