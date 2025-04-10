import axios from 'axios';

const api = axios.create({
    baseURL: `/api/budget`
});

export default api;
