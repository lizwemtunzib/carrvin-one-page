const API_SERVER_URL = (
    import.meta.env.VITE_API_URL ||
    'http://https://api.carrvin.com'
).replace(/\/$/, '');

const apiServerClient = {
    fetch: async (url, options = {}) => {
        return await window.fetch(`${API_SERVER_URL}${url}`, options);
    }
};

export default apiServerClient;

export { apiServerClient };

