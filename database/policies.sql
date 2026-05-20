-- OneTap Solution Supabase Row Level Security (RLS) Policies

-- ================================================================
-- Enable RLS on all tables
-- ================================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 1. Helper function to check if the current user is admin/superadmin
-- ================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role_slug VARCHAR(50);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overwrite the function to perform query inside users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role_slug VARCHAR(50);
BEGIN
    -- Check if auth.uid() is in users table and get role_slug
    SELECT r.slug INTO v_role_slug
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND u.is_deleted = FALSE AND u.status = 'Active';

    RETURN v_role_slug IN ('superadmin', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 2. Public Read / Admin Manage Tables (Projects, Services, Team, Testimonials, News, Settings)
-- ================================================================

-- Projects Policies
CREATE POLICY select_public_projects ON projects FOR SELECT 
    USING (status = 'Active' AND is_deleted = FALSE);
CREATE POLICY admin_all_projects ON projects FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Services Policies
CREATE POLICY select_public_services ON services FOR SELECT 
    USING (status = 'Active' AND is_deleted = FALSE);
CREATE POLICY admin_all_services ON services FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Team Policies
CREATE POLICY select_public_team ON team FOR SELECT 
    USING (status = 'Active' AND is_deleted = FALSE);
CREATE POLICY admin_all_team ON team FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Testimonials Policies
CREATE POLICY select_public_testimonials ON testimonials FOR SELECT 
    USING (status = 'Published');
CREATE POLICY admin_all_testimonials ON testimonials FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- News Policies
CREATE POLICY select_public_news ON news FOR SELECT 
    USING (status = 'Published' AND is_deleted = FALSE);
CREATE POLICY admin_all_news ON news FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Settings Policies
CREATE POLICY select_public_settings ON settings FOR SELECT USING (TRUE);
CREATE POLICY admin_all_settings ON settings FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ================================================================
-- 3. Public Insert / Admin Read & Update Tables (Contacts, Newsletter Subscribers)
-- ================================================================

-- Contacts Policies
CREATE POLICY insert_public_contacts ON contacts FOR INSERT WITH CHECK (TRUE);
CREATE POLICY admin_all_contacts ON contacts FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Newsletter Subscribers Policies
CREATE POLICY insert_public_newsletter ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY admin_all_newsletter ON newsletter_subscribers FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ================================================================
-- 4. Admin Only Tables (Users, Sessions, Roles, Permissions, Blocklist, Logs)
-- ================================================================

-- Roles & Permissions Policies (Read for authenticated, manage for superadmin)
CREATE POLICY read_authenticated_roles ON roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY read_authenticated_perms ON permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY read_authenticated_role_perms ON role_permissions FOR SELECT TO authenticated USING (TRUE);

-- Users Policies
CREATE POLICY admin_all_users ON users FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
-- Allow users to read and update their own profile details
CREATE POLICY user_read_self ON users FOR SELECT 
    TO authenticated USING (id = auth.uid());
CREATE POLICY user_update_self ON users FOR UPDATE 
    TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Logs & Sessions Policies (Admin/SuperAdmin only)
CREATE POLICY admin_all_activity_logs ON activity_logs FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_all_sessions ON sessions FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_all_login_attempts ON login_attempts FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_all_blocklist ON token_blocklist FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_all_visits ON visits FOR ALL 
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ================================================================
-- 5. Column-Level Security (Hide password column from public roles)
-- ================================================================

-- Revoke table-level SELECT privilege on users table from anon and authenticated roles
REVOKE SELECT ON public.users FROM anon, authenticated, public;

-- Grant SELECT only on safe columns to anon and authenticated roles
GRANT SELECT (id, email, role_id, status, is_deleted, created_at, updated_at) ON public.users TO anon, authenticated;

