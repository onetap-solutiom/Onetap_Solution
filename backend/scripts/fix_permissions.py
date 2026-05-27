import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from database.db import db
from sqlalchemy import text

app = create_app('development')

def fix():
    with app.app_context():
        print("Checking permissions...")
        # 1. Ensure permissions exist
        perms = ['view_logs', 'view_analytics']
        for p in perms:
            try:
                # Check if exists
                exists = db.session.execute(text("SELECT id FROM permissions WHERE slug = :s"), {'s': p}).fetchone()
                if not exists:
                    print(f"Adding permission: {p}")
                    db.session.execute(text("INSERT INTO permissions (name, slug) VALUES (:n, :s)"), {'n': p.replace('_', ' ').capitalize(), 's': p})
            except Exception as e:
                print(f"Error adding permission {p}: {e}")
        
        db.session.commit()

        # 2. Link to admin and superadmin roles
        roles = db.session.execute(text("SELECT id, slug FROM roles WHERE slug IN ('admin', 'superadmin')")).fetchall()
        for r_id, r_slug in roles:
            print(f"Processing role: {r_slug}")
            for p_slug in perms:
                try:
                    p_id = db.session.execute(text("SELECT id FROM permissions WHERE slug = :s"), {'s': p_slug}).fetchone()[0]
                    # Check if link exists
                    linked = db.session.execute(text("SELECT 1 FROM role_permissions WHERE role_id = :r AND permission_id = :p"), {'r': r_id, 'p': p_id}).fetchone()
                    if not linked:
                        print(f"Linking {p_slug} to {r_slug}")
                        db.session.execute(text("INSERT INTO role_permissions (role_id, permission_id) VALUES (:r, :p)"), {'r': r_id, 'p': p_id})
                except Exception as e:
                    print(f"Error linking {p_slug} to {r_slug}: {e}")
        
        db.session.commit()
        print("Permissions fix complete.")

if __name__ == '__main__':
    fix()
