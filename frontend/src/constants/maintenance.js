/**
 * Maintenance Status Constants
 */
export const MAINTENANCE_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

/**
 * Maintenance Category Constants
 */
export const MAINTENANCE_CATEGORY = {
    PRINTER: "printer",
    PC_DESKTOP: "pc_desktop",
    ACCESS_POINT: "access_point",
};

/**
 * User Role Constants
 */
export const USER_ROLES = {
    ADMIN: "admin",
    EMPLOYEE: "employee",
};

/**
 * Display labels for categories
 */
export const CATEGORY_LABELS = {
    [MAINTENANCE_CATEGORY.PRINTER]: "Printer",
    [MAINTENANCE_CATEGORY.PC_DESKTOP]: "PC Desktop",
    [MAINTENANCE_CATEGORY.ACCESS_POINT]: "Access Point",
};

/**
 * Display labels for status
 */
export const STATUS_LABELS = {
    [MAINTENANCE_STATUS.PENDING]: "Menunggu Persetujuan",
    [MAINTENANCE_STATUS.APPROVED]: "Disetujui",
    [MAINTENANCE_STATUS.REJECTED]: "Ditolak",
};
