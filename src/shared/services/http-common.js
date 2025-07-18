import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

axios.defaults.withCredentials = true;

const http = axios.create({
    baseURL: 'https://localhost:7138/api',
    headers: { 'content-type': 'application/json'}
});

export default http;