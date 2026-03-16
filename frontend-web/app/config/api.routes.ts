const BASE_URL_V1 = `/api/v1`;


const API_ROUTES = {
    LOGIN: `${BASE_URL_V1}/admin/login`,
    LOGOUT: `${BASE_URL_V1}/admin/logout`,
    MY_CLASSES: `${BASE_URL_V1}/timetable/class/all`,
    CLASS_BY_ID: `${BASE_URL_V1}/timetable/class`,
    START_SESSION: `${BASE_URL_V1}/sessions/start`,
    GENERATE_QR: (sid: string) => {
        return `${BASE_URL_V1}/sessions/${sid}/generate-qr`
    },
};

export default API_ROUTES;