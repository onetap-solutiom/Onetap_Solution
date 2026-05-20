/**
 * api.js — Shared data layer for OneTap Solution
 * Communicates with the Flask API backend with transparent fallback 
 * to Supabase Client for direct client-side queries.
 */
import apiClient from './apiClient';
import { supabase } from './supabaseClient';

// Helper to map backend project model to frontend format
function mapProjects(projectsList) {
  return projectsList.map(p => ({
    id: p.id,
    title: p.name || p.title,
    category: p.category || 'Web Development',
    desc: p.desc || p.description || '',
    image: p.image || p.img || '',
    url: p.url || p.demo_link || '#',
    github_link: p.github_link || p.github || '',
    deadline: p.deadline || '',
    progress: p.progress || 0,
    client: p.client || ''
  }));
}

export async function getProjects() {
  try {
    const res = await apiClient.get('/projects/');
    const result = res.data;
    if (result.success && result.data) {
      return mapProjects(result.data);
    }
  } catch (e) {
    console.warn('api.js: Flask offline, falling back to Supabase client for projects', e);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_deleted', false)
        .eq('status', 'Active');
      if (!error && data) {
        return mapProjects(data);
      }
    } catch (sbErr) {
      console.error('api.js: Supabase fallback failed for projects', sbErr);
    }
  }
  return [];
}

export async function getServices() {
  try {
    const res = await apiClient.get('/services/');
    const result = res.data;
    if (result.success && result.data) {
      return result.data.filter(s => s.status !== 'Inactive');
    }
  } catch (e) {
    console.warn('api.js: Flask offline, falling back to Supabase client for services', e);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_deleted', false)
        .eq('status', 'Active')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        return data;
      }
    } catch (sbErr) {
      console.error('api.js: Supabase fallback failed for services', sbErr);
    }
  }
  return [];
}

export async function getTestimonials() {
  try {
    const res = await apiClient.get('/testimonials/');
    const result = res.data;
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.warn('api.js: Flask offline, falling back to Supabase client for testimonials', e);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'Published');
      if (!error && data) {
        return data;
      }
    } catch (sbErr) {
      console.error('api.js: Supabase fallback failed for testimonials', sbErr);
    }
  }
  return [];
}

export async function getTeam() {
  try {
    const res = await apiClient.get('/team/');
    const result = res.data;
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.warn('api.js: Flask offline, falling back to Supabase client for team', e);
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .eq('status', 'Active')
        .eq('is_deleted', false);
      if (!error && data) {
        return data;
      }
    } catch (sbErr) {
      console.error('api.js: Supabase fallback failed for team', sbErr);
    }
  }
  return [];
}

export async function getStats() {
  try {
    const res = await apiClient.get('/stats/public');
    const result = res.data;
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.warn('api.js: Flask offline, falling back to Supabase client for stats', e);
    try {
      const [projCount, svcCount] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'Active'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'Active')
      ]);
      return {
        projects: projCount.count || 124,
        clients: 45,
        services: svcCount.count || 12,
        satisfaction: 98
      };
    } catch (sbErr) {
      console.error('api.js: Supabase fallback failed for stats', sbErr);
    }
  }
  return { projects: 124, clients: 45, services: 12, satisfaction: 98 };
}

export async function getNews() {
  try {
    const res = await apiClient.get('/news/');
    const result = res.data;
    if (result.success && result.data) {
      return result.data.filter(n => n.status === 'Published');
    }
  } catch (e) {
    console.warn('api.js: Flask offline, falling back to Supabase client for news', e);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'Published')
        .eq('is_deleted', false);
      if (!error && data) {
        return data;
      }
    } catch (sbErr) {
      console.error('api.js: Supabase fallback failed for news', sbErr);
    }
  }
  return [];
}

/**
 * Submit a contact message — Flask with Supabase fallback
 */
export async function submitContactMessage({ name, email, subject, message }) {
  try {
    const response = await apiClient.post('/contact/', { name, email, subject, message });
    const result = response.data;
    return { success: result.success, message: result.message };
  } catch (e) {
    console.warn('api.js: Flask offline, submitting contact directly to Supabase', e);
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{ name, email, subject, message }]);
      if (error) throw error;
      return { success: true, message: 'Message sent successfully via Supabase!' };
    } catch (sbErr) {
      console.error('api.js: Supabase submit failed', sbErr);
      return { success: false, message: 'Message submission failed.' };
    }
  }
}

/**
 * Subscribe to the newsletter — Flask with Supabase fallback
 */
export async function subscribeNewsletter(email) {
  try {
    const response = await apiClient.post('/newsletter/', { email });
    const result = response.data;
    return { success: result.success, message: result.message };
  } catch (e) {
    console.warn('api.js: Flask offline, subscribing directly to Supabase', e);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);
      if (error) throw error;
      return { success: true, message: 'Subscribed successfully via Supabase!' };
    } catch (sbErr) {
      console.error('api.js: Supabase subscribe failed', sbErr);
      return { success: false, message: 'Subscription failed.' };
    }
  }
}

/**
 * Fetch global site settings
 */
export async function getSettings() {
  try {
    const res = await apiClient.get('/settings/');
    const result = res.data;
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.warn('api.js: Flask offline, falling back to Supabase client for settings', e);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      if (!error && data) {
        return data;
      }
    } catch (sbErr) {
      console.error('api.js: Supabase fallback failed for settings', sbErr);
    }
  }
  // Fallback defaults
  return {
    company_email: 'info@onetapsolution.com',
    contact_phone: '+252 61 9586339',
    office_location: 'Mogadishu, Somalia'
  };
}
