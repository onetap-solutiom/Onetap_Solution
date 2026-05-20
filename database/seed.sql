-- OneTap Solution Supabase PostgreSQL Seed Data

-- ================================================================
-- 1. Seed Roles
-- ================================================================
INSERT INTO roles (id, name, slug, description, is_system) VALUES
(1, 'SuperAdmin', 'superadmin', 'Full unrestricted access to entire system', TRUE),
(2, 'Admin',      'admin',      'Manages all website content and users',      TRUE),
(3, 'Editor',     'editor',     'Creates and publishes content only',         TRUE),
(4, 'Employee',   'employee',   'Internal staff — limited read/write access', TRUE),
(5, 'Viewer',     'viewer',     'Read-only access to dashboard',              TRUE)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system;

-- Reset SERIAL sequence for roles table
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id)+1 FROM roles), 1), false);

-- ================================================================
-- 2. Seed Permissions
-- ================================================================
INSERT INTO permissions (name, slug, module, description) VALUES
-- User Management
('View Users',       'view_users',       'users',    'List and view user accounts'),
('Create User',      'create_user',      'users',    'Add new user accounts'),
('Edit User',        'edit_user',        'users',    'Modify existing user accounts'),
('Delete User',      'delete_user',      'users',    'Soft-delete user accounts'),
('Manage Roles',     'manage_roles',     'users',    'Assign and edit roles & permissions'),
-- Project Management
('View Projects',    'view_projects',    'projects', 'View portfolio projects'),
('Create Project',   'create_project',   'projects', 'Add new projects'),
('Edit Project',     'edit_project',     'projects', 'Edit existing projects'),
('Delete Project',   'delete_project',   'projects', 'Soft-delete projects'),
-- News Management
('View News',        'view_news',        'news',     'View all news articles'),
('Create News',      'create_news',      'news',     'Write new articles'),
('Edit News',        'edit_news',        'news',     'Edit existing articles'),
('Delete News',      'delete_news',      'news',     'Soft-delete articles'),
('Publish News',     'publish_news',     'news',     'Change news status to Published'),
-- Services
('View Services',    'view_services',    'services', 'View services'),
('Manage Services',  'manage_services',  'services', 'Create/edit/delete services'),
-- Team
('View Team',        'view_team',        'team',     'View team members'),
('Manage Team',      'manage_team',      'team',     'Add/edit/remove team members'),
-- Testimonials
('View Testimonials','view_testimonials','testimonials','View testimonials'),
('Manage Testimonials','manage_testimonials','testimonials','Add/edit/delete testimonials'),
-- Contacts
('View Contacts',    'view_contacts',    'contacts', 'Read inbound contact messages'),
('Reply Contacts',   'reply_contacts',   'contacts', 'Mark and reply to contacts'),
-- Newsletter
('Manage Newsletter','manage_newsletter','newsletter','View and manage subscribers'),
-- Dashboard
('View Dashboard',   'view_dashboard',   'dashboard','Access the admin dashboard'),
-- Settings
('Manage Settings',  'manage_settings',  'settings', 'Change global site settings'),
-- Logs
('View Logs',        'view_logs',        'logs',     'Access activity and audit logs')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    module = EXCLUDED.module,
    description = EXCLUDED.description;

-- Reset SERIAL sequence for permissions table
SELECT setval('permissions_id_seq', COALESCE((SELECT MAX(id)+1 FROM permissions), 1), false);

-- ================================================================
-- 3. Seed Role-Permission Mapping
-- ================================================================

-- SuperAdmin (1) — ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT DO NOTHING;

-- Admin (2) — Everything except manage_roles, view_logs, manage_settings
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions
WHERE slug NOT IN ('manage_roles','manage_settings','view_logs')
ON CONFLICT DO NOTHING;

-- Editor (3) — Content only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions
WHERE slug IN (
    'view_dashboard',
    'view_projects','create_project','edit_project',
    'view_news','create_news','edit_news','publish_news',
    'view_services',
    'view_team',
    'view_testimonials','manage_testimonials',
    'view_contacts'
)
ON CONFLICT DO NOTHING;

-- Employee (4) — Read + limited write
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions
WHERE slug IN (
    'view_dashboard',
    'view_projects',
    'view_news',
    'view_services',
    'view_team',
    'view_contacts',
    'view_testimonials'
)
ON CONFLICT DO NOTHING;

-- Viewer (5) — Dashboard + read-only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions
WHERE slug IN ('view_dashboard','view_projects','view_news','view_services','view_team')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 4. Seed Default SuperAdmin User
-- Password: admin123 (hashed with bcrypt)
-- ================================================================
INSERT INTO users (id, role_id, name, email, password_hash, status, email_verified, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Deterministic UUID for default SuperAdmin
    1,
    'OneTap SuperAdmin',
    'admin@onetapsolution.com',
    '$2b$12$XbaQB7nosokJ32llA8bEV.zHP42upAAt9P/pHaZwc4o/bk3SwVBX.',
    'Active',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET 
    role_id = EXCLUDED.role_id,
    status = EXCLUDED.status;

-- ================================================================
-- 5. Seed Settings
-- ================================================================
INSERT INTO settings (id, company_email, contact_phone, office_location, projects_done, trusted_partners, services_provided, satisfaction_rate)
VALUES (
    1,
    'info@onetapsolution.com',
    '+252 61 9586339',
    'Mogadishu, Somalia',
    124,
    45,
    12,
    98
)
ON CONFLICT (id) DO UPDATE SET
    company_email = EXCLUDED.company_email,
    contact_phone = EXCLUDED.contact_phone,
    office_location = EXCLUDED.office_location;

-- ================================================================
-- 6. Seed Default Services
-- ================================================================
INSERT INTO services (title, slug, description, icon, sort_order, status, created_by) VALUES
('Web Development',   'web-development',   'Fast, responsive and modern websites tailored to your business needs.',   'Code',        1, 'Active', '00000000-0000-0000-0000-000000000000'),
('Mobile Apps',       'mobile-apps',       'Cross-platform mobile applications for iOS and Android using Flutter.',   'Smartphone',  2, 'Active', '00000000-0000-0000-0000-000000000000'),
('UI/UX Design',      'ui-ux-design',      'Beautiful and intuitive user interface and experience design.',           'Palette',     3, 'Active', '00000000-0000-0000-0000-000000000000'),
('Cloud Solutions',   'cloud-solutions',   'Reliable cloud infrastructure, deployment and DevOps services.',          'Cloud',       4, 'Active', '00000000-0000-0000-0000-000000000000'),
('Digital Marketing', 'digital-marketing', 'Grow your brand with SEO, social media and content marketing.',          'Megaphone',   5, 'Active', '00000000-0000-0000-0000-000000000000'),
('IT Consulting',     'it-consulting',     'Expert technology consulting to help your business grow and scale.',      'Lightbulb',   6, 'Active', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;
