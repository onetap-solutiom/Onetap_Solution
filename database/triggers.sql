-- OneTap Solution Supabase PostgreSQL Triggers & Functions

-- ================================================================
-- SECTION 1 — Auto-update updated_at timestamp
-- ================================================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_team_modtime BEFORE UPDATE ON team FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_testimonials_modtime BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_news_modtime BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_contacts_modtime BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_modified_column();


-- ================================================================
-- SECTION 2 — Audit logs function & triggers
-- ================================================================

CREATE OR REPLACE FUNCTION audit_record_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID := NULL;
    v_action VARCHAR(100);
    v_target_id VARCHAR(50);
    v_old_val JSONB := NULL;
    v_new_val JSONB := NULL;
BEGIN
    -- Determine operation
    IF (TG_OP = 'INSERT') THEN
        v_action := 'CREATE';
        v_target_id := NEW.id::text;
        v_new_val := row_to_json(NEW)::jsonb;
        -- Attempt to find who created
        IF (TG_TABLE_NAME IN ('projects', 'services', 'team', 'testimonials', 'news')) THEN
            v_user_id := NEW.created_by;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_action := 'UPDATE';
        v_target_id := NEW.id::text;
        v_old_val := row_to_json(OLD)::jsonb;
        v_new_val := row_to_json(NEW)::jsonb;
        IF (TG_TABLE_NAME IN ('projects', 'services', 'team', 'testimonials', 'news')) THEN
            v_user_id := NEW.updated_by;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        v_action := 'DELETE';
        v_target_id := OLD.id::text;
        v_old_val := row_to_json(OLD)::jsonb;
    END IF;

    -- Inject into activity_logs
    INSERT INTO activity_logs (
        user_id,
        action,
        module,
        target_id,
        target_type,
        old_value,
        new_value,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        v_user_id,
        v_action || '_' || UPPER(TG_TABLE_NAME),
        TG_TABLE_NAME,
        v_target_id,
        TG_TABLE_NAME,
        v_old_val,
        v_new_val,
        NULL, -- Will be set if context allows, or defaulted to null
        'Database Trigger System',
        CURRENT_TIMESTAMP
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply Audit Log triggers
CREATE TRIGGER audit_users_changes AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_record_changes();
CREATE TRIGGER audit_projects_changes AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION audit_record_changes();
CREATE TRIGGER audit_services_changes AFTER INSERT OR UPDATE OR DELETE ON services FOR EACH ROW EXECUTE FUNCTION audit_record_changes();
CREATE TRIGGER audit_team_changes AFTER INSERT OR UPDATE OR DELETE ON team FOR EACH ROW EXECUTE FUNCTION audit_record_changes();
CREATE TRIGGER audit_testimonials_changes AFTER INSERT OR UPDATE OR DELETE ON testimonials FOR EACH ROW EXECUTE FUNCTION audit_record_changes();
CREATE TRIGGER audit_news_changes AFTER INSERT OR UPDATE OR DELETE ON news FOR EACH ROW EXECUTE FUNCTION audit_record_changes();
