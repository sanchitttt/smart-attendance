
const BASE_URL = "https://attendance-nitkkr.xyz/api/v1";

const API_CONFIG = {
    LOGIN: `${BASE_URL}/users/login`,
    DASHBOARD: `${BASE_URL}/users/dashboard`,
    FACE_VERIFY: `${BASE_URL}/attendance/face-scan`,
    SCAN_QR: `${BASE_URL}/attendance/scan-qr`,
    SUBJECT_HISTORY: `${BASE_URL}/attendance/subject-history`,
    CREATE_DISPUTE: `${BASE_URL}/attendance/disputes`,
};

export default API_CONFIG;