/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const AdminContext = createContext();

const APP_DATA_KEY = 'ots-app-data';
const SESSION_KEY = 'ots-admin-session';

const defaultData = {
    stats: {
        projects: 0,
        clients: 20,
        services: 0,
        satisfaction: 3
    },
    users: [],
    projects: [],
    visitorCount: 1240,
    services: [],
    messages: [],
    news: [],
    team: [],
    testimonials: []
};

const COLLECTION_APIS = {
    users: '/users/',
    projects: '/projects/',
    services: '/services/',
    team: '/team/',
    testimonials: '/testimonials/',
    news: '/news/',
    messages: '/contact/'
};

export const AdminProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        try {
            const savedData = localStorage.getItem(APP_DATA_KEY);
            return savedData ? { ...defaultData, ...JSON.parse(savedData) } : defaultData;
        } catch (e) {
            console.error("Error loading app data:", e);
            return defaultData;
        }
    });

    const [user, setUser] = useState(() => {
        try {
            const session = localStorage.getItem(SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            console.error("Error loading session:", e);
            return null;
        }
    });

    // Listen to token refresh and auto-logout events from the apiClient layer
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            localStorage.removeItem(SESSION_KEY);
        };
        const handleSessionRefreshed = () => {
            try {
                const sessionStr = localStorage.getItem(SESSION_KEY);
                if (sessionStr) {
                    setUser(JSON.parse(sessionStr));
                }
            } catch (e) {
                console.error("Syncing session on refresh failed:", e);
            }
        };

        window.addEventListener('ots-unauthorized', handleUnauthorized);
        window.addEventListener('ots-session-refreshed', handleSessionRefreshed);

        return () => {
            window.removeEventListener('ots-unauthorized', handleUnauthorized);
            window.removeEventListener('ots-session-refreshed', handleSessionRefreshed);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event('app-data-updated'));
    }, [data]);

    const login = async (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        try {
            const response = await apiClient.post('/auth/login', {
                email: cleanEmail,
                password: cleanPassword
            });

            const result = response.data;

            if (!result.success || !result.data) {
                return { success: false, message: result.message || 'Invalid email or password' };
            }

            const { token, refresh_token, user: apiUser } = result.data;

            const sessionData = {
                id:          apiUser.id,
                name:        apiUser.name,
                email:       apiUser.email,
                role:        apiUser.role,
                role_slug:   apiUser.role_slug,
                avatar:      apiUser.avatar || null,
                permissions: apiUser.permissions || ['all'],
                token:       token,
                refresh_token: refresh_token,
                time:        Date.now()
            };

            setUser(sessionData);
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            return { success: true };

        } catch (err) {
            console.error('Login API error:', err);
            const errMsg = err.response?.data?.message || 'Cannot connect to server. Make sure the backend is running.';
            return { success: false, message: errMsg };
        }
    };

    const logout = async () => {
        try {
            // Attempt to inform backend of token revocation (optional)
            await apiClient.post('/auth/logout');
        } catch (err) {
            console.error('Backend logout notification error:', err);
        } finally {
            setUser(null);
            localStorage.removeItem(SESSION_KEY);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            if (!user?.token) return;
            
            try {
                const [
                    usersRes,
                    projectsRes,
                    servicesRes,
                    teamRes,
                    testimonialsRes,
                    messagesRes,
                    newsRes,
                    statsRes
                ] = await Promise.all([
                    apiClient.get(COLLECTION_APIS.users).then(r => r.data).catch(() => ({ success: false, data: [] })),
                    apiClient.get(COLLECTION_APIS.projects).then(r => r.data).catch(() => ({ success: false, data: [] })),
                    apiClient.get(COLLECTION_APIS.services).then(r => r.data).catch(() => ({ success: false, data: [] })),
                    apiClient.get(COLLECTION_APIS.team).then(r => r.data).catch(() => ({ success: false, data: [] })),
                    apiClient.get(COLLECTION_APIS.testimonials).then(r => r.data).catch(() => ({ success: false, data: [] })),
                    apiClient.get(COLLECTION_APIS.messages).then(r => r.data).catch(() => ({ success: false, data: [] })),
                    apiClient.get(COLLECTION_APIS.news).then(r => r.data).catch(() => ({ success: false, data: [] })),
                    apiClient.get('/stats/dashboard').then(r => r.data).catch(() => ({ success: false, data: null }))
                ]);

                setData(prev => {
                    const u = usersRes.success ? usersRes.data : prev.users;
                    const p = projectsRes.success ? projectsRes.data : prev.projects;
                    const s = servicesRes.success ? servicesRes.data : prev.services;
                    const t = teamRes.success ? teamRes.data : prev.team;
                    const test = testimonialsRes.success ? testimonialsRes.data : prev.testimonials;
                    const msg = messagesRes.success ? messagesRes.data : prev.messages;
                    const news = newsRes.success ? newsRes.data : prev.news;
                    const dashboardStats = statsRes.success && statsRes.data ? statsRes.data : prev.dashboardStats;

                    return {
                        ...prev,
                        users: u,
                        projects: p,
                        services: s,
                        team: t,
                        testimonials: test,
                        messages: msg,
                        news: news,
                        visitorCount: dashboardStats?.stats?.visitors?.value || prev.visitorCount,
                        dashboardStats: dashboardStats,
                        stats: {
                            projects: p.length,
                            clients: 20,
                            services: s.length,
                            satisfaction: 3
                        }
                    };
                });
            } catch (err) {
                console.error("Failed to load dashboard data from database:", err);
            }
        };
        fetchAllData();
    }, [user?.token]);

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'Super Admin' || user.role_slug === 'superadmin' || user.permissions?.includes('all')) return true;
        return user.permissions?.includes(permission);
    };

    const updateCollection = async (key, newItem, id = null) => {
        const apiUrl = COLLECTION_APIS[key];
        
        if (apiUrl) {
            if (!user?.token) return { success: false, message: "Unauthorized" };
            try {
                const url = id ? `${apiUrl}${id}` : apiUrl;
                let response;

                if (id) {
                    response = await apiClient.put(url, newItem);
                } else {
                    response = await apiClient.post(url, newItem);
                }
                
                const result = response.data;
                if (response.status >= 200 && response.status < 300 && result.success) {
                    setData(prev => {
                        const collection = prev[key] || [];
                        let newCollection;
                        if (id) {
                            newCollection = collection.map(item => item.id === id ? result.data : item);
                        } else {
                            newCollection = [...collection, result.data];
                        }
                        
                        const updatedStats = { ...prev.stats };
                        if (key === 'projects') updatedStats.projects = newCollection.length;
                        if (key === 'services') updatedStats.services = newCollection.length;
                        
                        return { 
                            ...prev, 
                            [key]: newCollection,
                            stats: updatedStats
                        };
                    });
                    return { success: true, data: result.data };
                } else {
                    alert(result.message || `Failed to save ${key}`);
                    return { success: false, message: result.message };
                }
            } catch (err) {
                console.error(`Error saving ${key}:`, err);
                const errMsg = err.response?.data?.message || `Cannot connect to server. ${key} not saved.`;
                alert(errMsg);
                return { success: false, message: errMsg };
            }
        }

        // Fallback
        setData(prev => {
            const collection = prev[key] || [];
            let newCollection;
            if (id) {
                newCollection = collection.map(item => item.id === id ? { ...item, ...newItem } : item);
            } else {
                newCollection = [...collection, { ...newItem, id: String(Date.now()) }];
            }
            return { ...prev, [key]: newCollection };
        });
        return { success: true };
    };

    const deleteFromCollection = async (key, id) => {
        const apiUrl = COLLECTION_APIS[key];
        
        if (apiUrl) {
            if (!user?.token) return { success: false, message: "Unauthorized" };
            try {
                const response = await apiClient.delete(`${apiUrl}${id}`);
                const result = response.data;
                if (response.status >= 200 && response.status < 300 && result.success) {
                    setData(prev => {
                        const newCollection = (prev[key] || []).filter(item => item.id !== id);
                        
                        const updatedStats = { ...prev.stats };
                        if (key === 'projects') updatedStats.projects = newCollection.length;
                        if (key === 'services') updatedStats.services = newCollection.length;
                        
                        return { 
                            ...prev, 
                            [key]: newCollection,
                            stats: updatedStats
                        };
                    });
                    return { success: true };
                } else {
                    alert(result.message || `Failed to delete ${key}`);
                    return { success: false, message: result.message };
                }
            } catch (err) {
                console.error(`Error deleting ${key}:`, err);
                const errMsg = err.response?.data?.message || `Cannot connect to server. ${key} not deleted.`;
                alert(errMsg);
                return { success: false, message: errMsg };
            }
        }

        // Fallback
        setData(prev => ({
            ...prev,
            [key]: (prev[key] || []).filter(item => item.id !== id)
        }));
        return { success: true };
    };

    return (
        <AdminContext.Provider value={{ 
            data, 
            user, 
            login, 
            logout, 
            updateCollection, 
            deleteFromCollection,
            setData,
            hasPermission 
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
