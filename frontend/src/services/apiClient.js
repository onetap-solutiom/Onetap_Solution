import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;
const SESSION_KEY = 'ots-admin-session';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session && session.token) {
          config.headers['Authorization'] = `Bearer ${session.token}`;
        }
      }
    } catch (e) {
      console.error('Error parsing session for request interceptor', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (!sessionStr) {
          throw new Error('No session data found');
        }

        const session = JSON.parse(sessionStr);
        const refreshToken = session.refresh_token;

        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        // Call backend refresh endpoint
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
          },
        });

        if (res.data && res.data.success && res.data.data.token) {
          const newAccessToken = res.data.data.token;
          
          // Update local session
          session.token = newAccessToken;
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));

          // Notify application of token change if needed
          window.dispatchEvent(new Event('ots-session-refreshed'));

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry original request
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh response invalid');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Clear local storage and log out
        localStorage.removeItem(SESSION_KEY);
        window.dispatchEvent(new Event('ots-unauthorized'));
        
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
