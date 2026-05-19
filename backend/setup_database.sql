--   OneTap Solution 
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ================================================================
-- SECTION 0 — Create & Select Database
-- ================================================================

CREATE DATABASE IF NOT EXISTS otsDP
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE otsDP;

-- ================================================================
-- SECTION 1 — RBAC: Roles
-- ================================================================

CREATE TABLE IF NOT EXISTS roles (
    id          TINYINT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)         NOT NULL COMMENT 'e.g. SuperAdmin, Admin, Editor',
    slug        VARCHAR(50)         NOT NULL COMMENT 'machine-friendly: superadmin, admin',
    description VARCHAR(255),
    is_system   TINYINT(1)          NOT NULL DEFAULT 0 COMMENT '1 = cannot be deleted',
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RBAC — role definitions';

-- ================================================================
-- SECTION 2 — RBAC: Permissions
-- ================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)        NOT NULL COMMENT 'e.g. create_user',
    slug        VARCHAR(100)        NOT NULL COMMENT 'machine slug',
    module      VARCHAR(60)         NOT NULL COMMENT 'group: users, projects, news …',
    description VARCHAR(255),
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_permissions_slug (slug),
    INDEX idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RBAC — granular permissions catalogue';

-- ================================================================
-- SECTION 3 — RBAC: Role ↔ Permission Mapping
-- ================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id         TINYINT UNSIGNED    NOT NULL,
    permission_id   SMALLINT UNSIGNED   NOT NULL,
    granted_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role       FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RBAC — maps permissions to roles';

-- ================================================================
-- SECTION 4 — Users
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    role_id         TINYINT UNSIGNED    NOT NULL DEFAULT 2  COMMENT 'FK → roles.id',
    name            VARCHAR(100)        NOT NULL,
    email           VARCHAR(120)        NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL            COMMENT 'bcrypt only — never plain text',
    avatar          VARCHAR(255)                            COMMENT 'profile image path',
    phone           VARCHAR(30),
    status          ENUM('Active','Inactive','Suspended','Pending')
                                        NOT NULL DEFAULT 'Active',
    email_verified  TINYINT(1)          NOT NULL DEFAULT 0,
    two_fa_secret   VARCHAR(64)                             COMMENT 'TOTP seed (nullable until enabled)',
    two_fa_enabled  TINYINT(1)          NOT NULL DEFAULT 0,
    last_login_at   DATETIME,
    last_login_ip   VARCHAR(45)                             COMMENT 'IPv4 or IPv6',
    password_changed_at DATETIME,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0  COMMENT 'soft delete',
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email   (email),
    INDEX idx_users_role        (role_id),
    INDEX idx_users_status      (status),
    INDEX idx_users_is_deleted  (is_deleted),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='All user accounts — Admin, Editor, Employee, etc.';

-- ================================================================
-- SECTION 5 — Sessions (Token Management)
-- ================================================================

CREATE TABLE IF NOT EXISTS sessions (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED        NOT NULL,
    token_hash      VARCHAR(255)        NOT NULL            COMMENT 'SHA-256 of JWT/session token',
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    is_revoked      TINYINT(1)          NOT NULL DEFAULT 0,
    expires_at      DATETIME            NOT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_sessions_token    (token_hash),
    INDEX idx_sessions_user         (user_id),
    INDEX idx_sessions_expires      (expires_at),
    INDEX idx_sessions_revoked      (is_revoked),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Secure session / JWT token tracking';

-- ================================================================
-- SECTION 6 — Login Attempts (Brute-Force Protection)
-- ================================================================

CREATE TABLE IF NOT EXISTS login_attempts (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    email           VARCHAR(120)        NOT NULL,
    ip_address      VARCHAR(45)         NOT NULL,
    success         TINYINT(1)          NOT NULL DEFAULT 0,
    user_agent      VARCHAR(500),
    attempted_at    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_la_email      (email),
    INDEX idx_la_ip         (ip_address),
    INDEX idx_la_attempted  (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Track failed / successful login attempts for brute-force protection';

-- ================================================================
-- SECTION 7 — Activity / Audit Logs
-- ================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED                                COMMENT 'NULL = system or unauthenticated',
    action      VARCHAR(100)        NOT NULL                COMMENT 'e.g. user.login, project.delete',
    module      VARCHAR(60)         NOT NULL                COMMENT 'users, projects, news …',
    target_id   INT UNSIGNED                                COMMENT 'PK of affected record',
    target_type VARCHAR(60)                                 COMMENT 'table / model name',
    old_value   JSON                                        COMMENT 'snapshot before change',
    new_value   JSON                                        COMMENT 'snapshot after change',
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_al_user       (user_id),
    INDEX idx_al_module     (module),
    INDEX idx_al_action     (action),
    INDEX idx_al_created    (created_at),
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Immutable audit trail for all sensitive operations';

-- ================================================================
-- SECTION 8 — Projects
-- ================================================================

CREATE TABLE IF NOT EXISTS projects (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    title           VARCHAR(150)        NOT NULL,
    slug            VARCHAR(170)        NOT NULL            COMMENT 'URL-safe unique identifier',
    description     TEXT,
    image           VARCHAR(255)                            COMMENT 'relative path under /uploads/',
    github_link     VARCHAR(255),
    demo_link       VARCHAR(255),
    technologies    VARCHAR(500)                            COMMENT 'comma-separated list',
    client          VARCHAR(100),
    category        VARCHAR(100),
    status          ENUM('Active','Draft','Archived')
                                        NOT NULL DEFAULT 'Active',
    is_featured     TINYINT(1)          NOT NULL DEFAULT 0,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0,
    created_by      INT UNSIGNED,
    updated_by      INT UNSIGNED,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_projects_slug     (slug),
    INDEX idx_projects_status       (status),
    INDEX idx_projects_category     (category),
    INDEX idx_projects_is_deleted   (is_deleted),
    INDEX idx_projects_created_at   (created_at),
    CONSTRAINT fk_projects_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_projects_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Portfolio projects';

-- ================================================================
-- SECTION 9 — Services
-- ================================================================

CREATE TABLE IF NOT EXISTS services (
    id          INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    title       VARCHAR(150)        NOT NULL,
    slug        VARCHAR(170)        NOT NULL,
    description TEXT                NOT NULL,
    icon        VARCHAR(100)                                COMMENT 'icon class or component name',
    sort_order  SMALLINT UNSIGNED   NOT NULL DEFAULT 0      COMMENT 'display ordering',
    status      ENUM('Active','Inactive')
                                    NOT NULL DEFAULT 'Active',
    is_deleted  TINYINT(1)          NOT NULL DEFAULT 0,
    created_by  INT UNSIGNED,
    updated_by  INT UNSIGNED,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_services_slug     (slug),
    INDEX idx_services_status       (status),
    INDEX idx_services_is_deleted   (is_deleted),
    CONSTRAINT fk_services_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_services_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Services offered by OneTap Solution';

-- ================================================================
-- SECTION 10 — Team Members
-- ================================================================

CREATE TABLE IF NOT EXISTS team (
    id          INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)        NOT NULL,
    position    VARCHAR(100)        NOT NULL                COMMENT 'Job title / role',
    bio         TEXT,
    image       VARCHAR(255),
    email       VARCHAR(120),
    phone       VARCHAR(30),
    linkedin    VARCHAR(255),
    github      VARCHAR(255),
    twitter     VARCHAR(255),
    sort_order  SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
    status      ENUM('Active','Inactive')
                                    NOT NULL DEFAULT 'Active',
    is_deleted  TINYINT(1)          NOT NULL DEFAULT 0,
    created_by  INT UNSIGNED,
    updated_by  INT UNSIGNED,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_team_status       (status),
    INDEX idx_team_is_deleted   (is_deleted),
    CONSTRAINT fk_team_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_team_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Company team members';

-- ================================================================
-- SECTION 11 — Testimonials
-- ================================================================

CREATE TABLE IF NOT EXISTS testimonials (
    id          INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    client_name VARCHAR(100)        NOT NULL,
    company     VARCHAR(100),
    position    VARCHAR(100),
    feedback    TEXT                NOT NULL,
    rating      TINYINT UNSIGNED    NOT NULL DEFAULT 5      COMMENT '1–5 stars',
    image       VARCHAR(255),
    is_featured TINYINT(1)          NOT NULL DEFAULT 0,
    status      ENUM('Published','Draft','Hidden')
                                    NOT NULL DEFAULT 'Published',
    created_by  INT UNSIGNED,
    updated_by  INT UNSIGNED,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_testimonials_status   (status),
    INDEX idx_testimonials_rating   (rating),
    CONSTRAINT fk_testimonials_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_testimonials_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Client testimonials / reviews';

-- ================================================================
-- SECTION 12 — News / Blog
-- ================================================================

CREATE TABLE IF NOT EXISTS news (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    author_id       INT UNSIGNED                            COMMENT 'FK → users.id',
    title           VARCHAR(200)        NOT NULL,
    slug            VARCHAR(220)        NOT NULL,
    content         LONGTEXT            NOT NULL,
    excerpt         VARCHAR(500),
    image           VARCHAR(255),
    category        VARCHAR(100),
    tags            VARCHAR(500)                            COMMENT 'comma-separated',
    status          ENUM('Published','Draft','Archived')
                                        NOT NULL DEFAULT 'Draft',
    is_featured     TINYINT(1)          NOT NULL DEFAULT 0,
    view_count      INT UNSIGNED        NOT NULL DEFAULT 0,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0,
    published_at    DATETIME,
    created_by      INT UNSIGNED,
    updated_by      INT UNSIGNED,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_news_slug         (slug),
    INDEX idx_news_author           (author_id),
    INDEX idx_news_status           (status),
    INDEX idx_news_category         (category),
    INDEX idx_news_is_deleted       (is_deleted),
    INDEX idx_news_published_at     (published_at),
    CONSTRAINT fk_news_author  FOREIGN KEY (author_id)  REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_news_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_news_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Blog and news articles';

-- ================================================================
-- SECTION 13 — Contacts (Website Contact Form)
-- ================================================================

CREATE TABLE IF NOT EXISTS contacts (
    id          INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(120)        NOT NULL,
    phone       VARCHAR(30),
    subject     VARCHAR(150),
    message     TEXT                NOT NULL,
    ip_address  VARCHAR(45),
    is_read     TINYINT(1)          NOT NULL DEFAULT 0,
    is_replied  TINYINT(1)          NOT NULL DEFAULT 0,
    replied_by  INT UNSIGNED,
    replied_at  DATETIME,
    status      ENUM('New','Read','Replied','Spam','Archived')
                                    NOT NULL DEFAULT 'New',
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_contacts_email        (email),
    INDEX idx_contacts_status       (status),
    INDEX idx_contacts_created_at   (created_at),
    CONSTRAINT fk_contacts_replied FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Inbound messages from the website contact form';

-- ================================================================
-- SECTION 14 — Newsletter Subscribers
-- ================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    email           VARCHAR(120)        NOT NULL,
    name            VARCHAR(100),
    status          ENUM('Active','Unsubscribed','Bounced')
                                        NOT NULL DEFAULT 'Active',
    subscribed_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME,
    ip_address      VARCHAR(45),
    PRIMARY KEY (id),
    UNIQUE KEY uq_newsletter_email  (email),
    INDEX idx_newsletter_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Newsletter / mailing list subscribers';

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- SECTION 15 — SEED: Roles
-- ================================================================

INSERT INTO roles (id, name, slug, description, is_system) VALUES
(1, 'SuperAdmin', 'superadmin', 'Full unrestricted access to entire system', 1),
(2, 'Admin',      'admin',      'Manages all website content and users',      1),
(3, 'Editor',     'editor',     'Creates and publishes content only',         1),
(4, 'Employee',   'employee',   'Internal staff — limited read/write access', 1),
(5, 'Viewer',     'viewer',     'Read-only access to dashboard',              1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ================================================================
-- SECTION 16 — SEED: Permissions
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
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ================================================================
-- SECTION 17 — SEED: Role → Permission Mapping
-- ================================================================

-- SuperAdmin (1) — ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON DUPLICATE KEY UPDATE granted_at = granted_at;

-- Admin (2) — Everything except manage_roles, view_logs, manage_settings
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions
WHERE slug NOT IN ('manage_roles','manage_settings','view_logs')
ON DUPLICATE KEY UPDATE granted_at = granted_at;

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
ON DUPLICATE KEY UPDATE granted_at = granted_at;

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
ON DUPLICATE KEY UPDATE granted_at = granted_at;

-- Viewer (5) — Dashboard + read-only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions
WHERE slug IN ('view_dashboard','view_projects','view_news','view_services','view_team')
ON DUPLICATE KEY UPDATE granted_at = granted_at;

-- ================================================================
-- SECTION 18 — SEED: 

INSERT INTO users (role_id, name, email, password_hash, status, email_verified, created_at)
VALUES (
    1,
    'OneTap SuperAdmin',
    'admin@onetapsolution.com',
    '$2b$12$XbaQB7nosokJ32llA8bEV.zHP42upAAt9P/pHaZwc4o/bk3SwVBX.',
    'Active',
    1,
    NOW()
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), status = VALUES(status);

-- ================================================================
-- SECTION 19 — SEED: Sample Services
-- ================================================================

INSERT INTO services (title, slug, description, icon, sort_order, status) VALUES
('Web Development',   'web-development',   'Fast, responsive and modern websites tailored to your business needs.',   'FaCode',        1, 'Active'),
('Mobile Apps',       'mobile-apps',       'Cross-platform mobile applications for iOS and Android using Flutter.',   'FaMobileAlt',   2, 'Active'),
('UI/UX Design',      'ui-ux-design',      'Beautiful and intuitive user interface and experience design.',           'FaPalette',     3, 'Active'),
('Cloud Solutions',   'cloud-solutions',   'Reliable cloud infrastructure, deployment and DevOps services.',          'FaCloud',       4, 'Active'),
('Digital Marketing', 'digital-marketing', 'Grow your brand with SEO, social media and content marketing.',          'FaBullhorn',    5, 'Active'),
('IT Consulting',     'it-consulting',     'Expert technology consulting to help your business grow and scale.',      'FaLightbulb',   6, 'Active')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ================================================================
-- SECTION 20 — Site Settings
-- ================================================================

CREATE TABLE IF NOT EXISTS settings (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    company_email   VARCHAR(120)        NOT NULL DEFAULT 'info@onetapsolution.com',
    contact_phone   VARCHAR(30)         NOT NULL DEFAULT '+252 61 9586339',
    office_location VARCHAR(255)        NOT NULL DEFAULT 'Mogadishu, Somalia',
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Global site configurations and contact details';

INSERT INTO settings (id, company_email, contact_phone, office_location)
VALUES (1, 'info@onetapsolution.com', '+252 61 9586339', 'Mogadishu, Somalia')
ON DUPLICATE KEY UPDATE 
    company_email = VALUES(company_email),
    contact_phone = VALUES(contact_phone),
    office_location = VALUES(office_location);

-- ================================================================
-- DONE
-- ================================================================
SELECT
    'otsDP database setup complete!' AS Status,
    (SELECT COUNT(*) FROM roles)       AS Roles_Created,
    (SELECT COUNT(*) FROM permissions) AS Permissions_Created,
    (SELECT COUNT(*) FROM users)       AS Admin_Accounts,
    (SELECT COUNT(*) FROM services)    AS Services_Seeded,
    (SELECT COUNT(*) FROM settings)    AS Settings_Seeded;
