
const BASE_URL = "https://192.168.0.102:8082/api/v1";

const API_CONFIG = {
    LOGIN: `${BASE_URL}/users/login`,
    FACE_VERIFY: `${BASE_URL}/attendance/face-scan`,
    SCAN: `${BASE_URL}/attendance/scan-qr`,
};

export default API_CONFIG;