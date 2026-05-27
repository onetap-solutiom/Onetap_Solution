import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import apiClient from './services/apiClient'

// Fetch all public data from database and cache to localStorage
const bootstrapPublicData = async () => {
    try {
        const [projectsRes, servicesRes, teamRes, testimonialsRes, newsRes] = await Promise.all([
            apiClient.get('/projects/').then(r => r.data).catch(() => ({ success: false, data: [] })),
            apiClient.get('/services/').then(r => r.data).catch(() => ({ success: false, data: [] })),
            apiClient.get('/team/').then(r => r.data).catch(() => ({ success: false, data: [] })),
            apiClient.get('/testimonials/').then(r => r.data).catch(() => ({ success: false, data: [] })),
            apiClient.get('/news/').then(r => r.data).catch(() => ({ success: false, data: [] })),
        ]);

        const raw = localStorage.getItem('ots-app-data');
        const currentData = raw ? JSON.parse(raw) : {};

        const updatedData = {
            ...currentData,
            projects: projectsRes.success ? projectsRes.data : (currentData.projects || []),
            services: servicesRes.success ? servicesRes.data : (currentData.services || []),
            team: teamRes.success ? teamRes.data : (currentData.team || []),
            testimonials: testimonialsRes.success ? testimonialsRes.data : (currentData.testimonials || []),
            news: newsRes.success ? newsRes.data : (currentData.news || []),
            stats: {
                projects: projectsRes.success ? projectsRes.data.length : (currentData.stats?.projects || 0),
                clients: 20,
                services: servicesRes.success ? servicesRes.data.length : (currentData.stats?.services || 0),
                satisfaction: 99
            }
        };

        localStorage.setItem('ots-app-data', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('app-data-updated'));
    } catch (e) {
        console.error("Failed to bootstrap public database data from server:", e);
    }
};

// Keep backend alive (prevents Render free tier from sleeping)
const keepBackendAlive = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/health`)
        .then(() => console.log('[KeepAlive] Backend is awake.'))
        .catch(() => console.warn('[KeepAlive] Backend ping failed, it may be waking up...'));
};

// Ping immediately on load, then every 10 minutes
keepBackendAlive();
setInterval(keepBackendAlive, 10 * 60 * 1000);

// Initiate dynamic backend synchronization
bootstrapPublicData();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
