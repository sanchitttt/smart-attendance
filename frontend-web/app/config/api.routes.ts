const BASE_PATH_V1 = "/api/v1";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const v1 = (path: string) => `${API_BASE_URL}${BASE_PATH_V1}${path}`

const API_ROUTES = {
    // Auth
    LOGIN: v1("/admin/login"),
    LOGOUT: v1("/admin/logout"),

    // Timetable / classes
    MY_CLASSES: v1("/timetable/class/all"),
    TIMETABLE_SUMMARY: v1("/timetable/summary"),
    TIMETABLE_AT_RISK_STUDENTS: v1("/timetable/summary/at-risk-students"),
    CLASS_SESSION_DETAILS: (timetableId: string | number,sessionId: string | number) =>
        v1(`/timetable/class/${timetableId}/${sessionId}`),

    // Sessions
    CREATE_SESSION: v1("/sessions/create"),
    SESSION_START: (sid: string | number) => v1(`/sessions/${sid}/start`),
    GENERATE_QR: (sid: string | number) => v1(`/sessions/${sid}/generate-qr`),

    // Attendance
    SESSION_ATTENDANCE: (sessionId: string | number) => v1(`/attendance/session/${sessionId}`),
    ALL_DISPUTES: v1("/attendance/disputes/all"),
    DISPUTES_BY_TIMETABLE: (timetableId: string | number) => v1(`/attendance/disputes/timetable/${timetableId}`),
    REVIEW_DISPUTE: (disputeId: string | number) => v1(`/attendance/disputes/${disputeId}/review`),
    DISPUTE_IMAGE: (disputeId: string | number,type: "submitted" | "master") =>
        v1(`/attendance/disputes/${disputeId}/image?type=${type}`),
    STUDENT_PROFILE: (rollNo: string) => v1(`/users/student/${encodeURIComponent(rollNo)}`),
    STUDENT_MASTER_IMAGE: (rollNo: string) => v1(`/users/student/${encodeURIComponent(rollNo)}/master-image`),
};

export default API_ROUTES;