/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

const APP_DATA_KEY = 'ots-app-data';
const SESSION_KEY = 'ots-admin-session';

const defaultData = {
    stats: {
        projects: 0,
        clients: 20,
        services: 0,
        satisfaction: 99
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
    users: 'http://localhost:5000/api/users/',
    projects: 'http://localhost:5000/api/projects/',
    services: 'http://localhost:5000/api/services/',
    team: 'http://localhost:5000/api/team/',
    testimonials: 'http://localhost:5000/api/testimonials/',
    news: 'http://localhost:5000/api/news/',
    messages: 'http://localhost:5000/api/contact/'
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

    useEffect(() => {
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event('app-data-updated'));
    }, [data]);

    const login = async (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                return { success: false, message: result.message || 'Invalid email or password' };
            }

            const { token, user: apiUser } = result.data;

            const sessionData = {
                id:          apiUser.id,
                name:        apiUser.name,
                email:       apiUser.email,
                role:        apiUser.role,
                role_slug:   apiUser.role_slug,
                avatar:      apiUser.avatar || null,
                permissions: apiUser.permissions || ['all'],
                token:       token,
                time:        Date.now()
            };

            setUser(sessionData);
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            return { success: true };

        } catch (err) {
            console.error('Login API error:', err);
            return { success: false, message: 'Cannot connect to server. Make sure the backend is running.' };
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            if (!user?.token) return;
            const headers = { 'Authorization': `Bearer ${user.token}` };
            
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
                    fetch(COLLECTION_APIS.users, { headers }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch(COLLECTION_APIS.projects, { headers }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch(COLLECTION_APIS.services, { headers }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch(COLLECTION_APIS.team, { headers }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch(COLLECTION_APIS.testimonials, { headers }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch(COLLECTION_APIS.messages, { headers }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch(COLLECTION_APIS.news, { headers }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('http://localhost:5000/api/stats/dashboard', { headers }).then(r => r.json()).catch(() => ({ success: false, data: null }))
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
                            satisfaction: 99
                        }
                    };
                });
            } catch (err) {
                console.error("Failed to load dashboard data from MySQL:", err);
            }
        };
        fetchAllData();
    }, [user?.token]);

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'Super Admin' || user.role_slug === 'superadmin' || user.permissions?.includes('all')) return true;
        return user.permissions?.includes(permission);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
    };

    const updateCollection = async (key, newItem, id = null) => {
        const apiUrl = COLLECTION_APIS[key];
        
        if (apiUrl) {
            if (!user?.token) return { success: false, message: "Unauthorized" };
            try {
                const url = id ? `${apiUrl}${id}` : apiUrl;
                const method = id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify(newItem)
                });
                
                const result = await response.json();
                if (response.ok && result.success) {
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
                alert(`Cannot connect to server. ${key} not saved.`);
                return { success: false, message: 'Server connection failed' };
            }
        }

        // Fallback
        setData(prev => {
            const collection = prev[key] || [];
            let newCollection;
            if (id) {
                newCollection = collection.map(item => item.id === id ? { ...item, ...newItem } : item);
            } else {
                newCollection = [...collection, { ...newItem, id: Date.now() }];
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
                const response = await fetch(`${apiUrl}${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const result = await response.json();
                if (response.ok && result.success) {
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
                alert(`Cannot connect to server. ${key} not deleted.`);
                return { success: false, message: 'Server connection failed' };
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
