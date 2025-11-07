import { useCallback, useEffect, useState } from "react";
import { maintenanceService } from "../services/maintenanceService";

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || fallback;

export const useMaintenanceApprovals = (category, onPendingCountChange) => {
    const [pendingRecords, setPendingRecords] = useState([]);
    const [rejectedRecords, setRejectedRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchPending = useCallback(async () => {
        try {
            setLoading(true);
            const response = await maintenanceService.fetchPendingRecords(
                category
            );
            if (response.success) {
                setPendingRecords(response.data);
                setError("");
                onPendingCountChange?.(response.data?.length || 0);
            } else {
                const message =
                    response.message || "Gagal memuat pending records";
                setError(message);
                onPendingCountChange?.(0);
            }
        } catch (err) {
            setError(getErrorMessage(err, "Gagal memuat pending records"));
            onPendingCountChange?.(0);
        } finally {
            setLoading(false);
        }
    }, [category, onPendingCountChange]);

    const fetchRejected = useCallback(async () => {
        try {
            const response = await maintenanceService.fetchRejectedRecords(
                category
            );
            if (response.success) {
                setRejectedRecords(response.data);
            }
        } catch {
            // ignore rejected fetch error
        }
    }, [category]);

    useEffect(() => {
        fetchPending();
        fetchRejected();
    }, [fetchPending, fetchRejected]);

    const acceptRecord = useCallback(
        async (recordId) => {
            try {
                const response = await maintenanceService.acceptRecord(
                    recordId
                );
                if (response.success) {
                    await fetchPending();
                    await fetchRejected();
                    return { success: true };
                }
                return {
                    success: false,
                    message: response.message || "Gagal menerima record",
                };
            } catch (err) {
                return {
                    success: false,
                    message: getErrorMessage(err, "Gagal menerima record"),
                };
            }
        },
        [fetchPending, fetchRejected]
    );

    const rejectRecord = useCallback(
        async (recordId) => {
            try {
                const response = await maintenanceService.rejectRecord(
                    recordId
                );
                if (response.success) {
                    await fetchPending();
                    await fetchRejected();
                    return { success: true };
                }
                return {
                    success: false,
                    message: response.message || "Gagal menolak record",
                };
            } catch (err) {
                return {
                    success: false,
                    message: getErrorMessage(err, "Gagal menolak record"),
                };
            }
        },
        [fetchPending, fetchRejected]
    );

    const deleteRecord = useCallback(
        async (recordId) => {
            try {
                const response = await maintenanceService.deleteRecord(
                    recordId
                );
                if (response.success) {
                    await fetchPending();
                    await fetchRejected();
                    return { success: true };
                }
                return {
                    success: false,
                    message: response.message || "Gagal menghapus record",
                };
            } catch (err) {
                return {
                    success: false,
                    message: getErrorMessage(err, "Gagal menghapus record"),
                };
            }
        },
        [fetchPending, fetchRejected]
    );

    return {
        pendingRecords,
        rejectedRecords,
        loading,
        error,
        setError,
        fetchPending,
        fetchRejected,
        acceptRecord,
        rejectRecord,
        deleteRecord,
    };
};

export default useMaintenanceApprovals;
