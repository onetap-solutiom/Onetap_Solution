-- OneTap Solution Supabase PostgreSQL DDL Schema
-- Enables UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- SECTION 1 — Roles & Permissions
-- ================================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(60) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- ================================================================
-- SECTION 2 — Users & Sessions
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT DEFAULT 2,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Pending')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    totp_secret VARCHAR(64),
    totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    password_changed_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent VARCHAR(500),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- JWT Blocklist
CREATE TABLE IF NOT EXISTS token_blocklist (
    id SERIAL PRIMARY KEY,
    jti VARCHAR(36) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 3 — Core Features (CMS & CRM)
-- ================================================================

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(170) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    github_link VARCHAR(255),
    demo_link VARCHAR(255),
    technologies VARCHAR(500),
    client VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(170) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    bio TEXT,
    image VARCHAR(255),
    email VARCHAR(120),
    phone VARCHAR(30),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    twitter VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    position VARCHAR(100),
    feedback TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    image VARCHAR(255),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Hidden')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    image VARCHAR(255),
    category VARCHAR(100),
    tags VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Published', 'Draft', 'Archived')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(150),
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_replied BOOLEAN NOT NULL DEFAULT FALSE,
    replied_by UUID REFERENCES users(id) ON DELETE SET NULL,
    replied_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Read', 'Replied', 'Spam', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Unsubscribed', 'Bounced')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45)
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    company_email VARCHAR(120) NOT NULL DEFAULT 'info@onetapsolution.com',
    contact_phone VARCHAR(30) NOT NULL DEFAULT '+252 61 9586339',
    office_location VARCHAR(255) NOT NULL DEFAULT 'Mogadishu, Somalia',
    projects_done INT NOT NULL DEFAULT 0,
    trusted_partners INT NOT NULL DEFAULT 0,
    services_provided INT NOT NULL DEFAULT 0,
    satisfaction_rate INT NOT NULL DEFAULT 99,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500),
    page_visited VARCHAR(255) NOT NULL DEFAULT '/',
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 4 — Audit Logs
-- ================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(60) NOT NULL,
    target_id VARCHAR(50),  -- Handles UUID or integer primary keys as strings
    target_type VARCHAR(60),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 5 — Index Optimization
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_blocklist_jti ON token_blocklist(jti);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_is_deleted ON services(is_deleted);
CREATE INDEX IF NOT EXISTS idx_team_status ON team(status);
CREATE INDEX IF NOT EXISTS idx_team_is_deleted ON team(is_deleted);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_is_deleted ON news(is_deleted);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
