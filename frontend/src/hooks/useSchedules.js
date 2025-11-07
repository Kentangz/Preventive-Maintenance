import { useCallback, useEffect, useState } from "react";
import { scheduleService } from "../services/scheduleService";

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || fallback;

export const useSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const response = await scheduleService.list();
            if (response.success) {
                setSchedules(response.data);
                setError("");
            } else {
                setError(response.message || "Failed to fetch schedules");
            }
        } catch (err) {
            setError(getErrorMessage(err, "Failed to fetch schedules"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const saveSchedule = useCallback(
        async (formData, editingId) => {
            try {
                const response = editingId
                    ? await scheduleService.update(editingId, formData)
                    : await scheduleService.create(formData);

                if (response.success) {
                    await fetchSchedules();
                    return { success: true, message: response.message };
                }

                return {
                    success: false,
                    message: response.message || "Failed to save schedule",
                };
            } catch (err) {
                return {
                    success: false,
                    message: getErrorMessage(err, "Failed to save schedule"),
                };
            }
        },
        [fetchSchedules]
    );

    const deleteSchedule = useCallback(
        async (id) => {
            try {
                const response = await scheduleService.remove(id);
                if (response.success) {
                    await fetchSchedules();
                    return { success: true, message: response.message };
                }
                return {
                    success: false,
                    message: response.message || "Gagal menghapus dokumen",
                };
            } catch (err) {
                return {
                    success: false,
                    message: getErrorMessage(err, "Gagal menghapus dokumen"),
                };
            }
        },
        [fetchSchedules]
    );

    return {
        schedules,
        loading,
        error,
        setError,
        fetchSchedules,
        saveSchedule,
        deleteSchedule,
    };
};

export default useSchedules;
