// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/users';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Axios interceptor for CSRF token
axios.interceptors.request.use(
    config => {
        if (!config.url.endsWith('/')) {
            config.url += '/';
        }
        
        const token = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='));
        if (token) {
            config.headers['X-CSRFToken'] = token.split('=')[1];
        }
        return config;
    },
    error => Promise.reject(error)
);

// API Service object
const apiService = {
    // Auth endpoints
    auth: {
        login: (credentials) => axios.post('login/', credentials),
        signup: (userData) => axios.post('register/', userData),
        logout: () => axios.post('logout/'),
        getCSRFToken: () => axios.get('csrf/')
    },
    
    // Task endpoints
    tasks: {
        getAll: () => axios.get('tasks/'),
        create: (taskData) => axios.post('tasks/', taskData),
        update: (taskId, taskData) => axios.put(`tasks/${taskId}/`, taskData),
        delete: (taskId) => axios.delete(`tasks/${taskId}/`)
    }
};