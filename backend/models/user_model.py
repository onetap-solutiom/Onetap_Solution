import uuid
from database.db import db
from datetime import datetime

class Role(db.Model):
    __tablename__ = 'roles'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(50),  nullable=False)
    slug        = db.Column(db.String(50),  nullable=False, unique=True)
    description = db.Column(db.String(255))
    is_system   = db.Column(db.Boolean,  default=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users       = db.relationship('User', back_populates='role_obj', lazy='dynamic')

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'slug': self.slug}


class User(db.Model):
    __tablename__ = 'users'

    id                  = db.Column(db.Uuid,        primary_key=True, default=uuid.uuid4)
    role_id             = db.Column(db.Integer,     db.ForeignKey('roles.id'), nullable=False, default=2)
    name                = db.Column(db.String(100), nullable=False)
    email               = db.Column(db.String(120), unique=True, nullable=False)
    password_hash       = db.Column(db.String(255), nullable=False)
    avatar              = db.Column(db.String(255))
    phone               = db.Column(db.String(30))
    status              = db.Column(db.String(20),  default='Active')
    email_verified      = db.Column(db.Boolean,     default=False)
    totp_secret         = db.Column(db.String(64))
    totp_enabled        = db.Column(db.Boolean,     default=False)
    last_login_at       = db.Column(db.DateTime)
    last_login_ip       = db.Column(db.String(45))
    password_changed_at = db.Column(db.DateTime)
    is_deleted          = db.Column(db.Boolean,     default=False)
    created_at          = db.Column(db.DateTime,    default=datetime.utcnow)
    updated_at          = db.Column(db.DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)

    role_obj = db.relationship('Role', back_populates='users', lazy='joined')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    @property
    def role(self):
        """Return role name string for backward compatibility."""
        return self.role_obj.name if self.role_obj else 'Unknown'

    @property
    def role_slug(self):
        return self.role_obj.slug if self.role_obj else ''

    def is_admin(self):
        """True if role is superadmin or admin."""
        return self.role_slug in ('superadmin', 'admin')

    @property
    def permissions(self):
        """Fetch list of permission slugs for this user's role from database."""
        try:
            # Query permission slugs associated with this user's role_id
            sql = """
                SELECT p.slug 
                FROM permissions p
                JOIN role_permissions rp ON rp.permission_id = p.id
                WHERE rp.role_id = :role_id
            """
            result = db.session.execute(db.text(sql), {'role_id': self.role_id}).fetchall()
            return [row[0] for row in result]
        except Exception:
            # Fallback based on role_slug if query fails
            mapping = {
                'superadmin': ['all'],
                'admin': [
                    'view_dashboard', 'view_users', 'create_user', 'edit_user', 'delete_user',
                    'view_projects', 'create_project', 'edit_project', 'delete_project',
                    'view_news', 'create_news', 'edit_news', 'delete_news', 'publish_news',
                    'view_services', 'manage_services', 'view_team', 'manage_team',
                    'view_testimonials', 'manage_testimonials', 'view_contacts', 'reply_contacts',
                    'manage_newsletter', 'view_logs', 'view_analytics'
                ],
                'editor': [
                    'view_dashboard', 'view_projects', 'create_project', 'edit_project',
                    'view_news', 'create_news', 'edit_news', 'publish_news',
                    'view_services', 'view_team', 'view_testimonials', 'manage_testimonials',
                    'view_contacts'
                ],
                'employee': [
                    'view_dashboard', 'view_projects', 'view_news', 'view_services',
                    'view_team', 'view_contacts', 'view_testimonials'
                ],
                'viewer': [
                    'view_dashboard', 'view_projects', 'view_news', 'view_services', 'view_team'
                ]
            }
            return mapping.get(self.role_slug, ['view_dashboard'])

    def to_dict(self):
        return {
            'id':           str(self.id) if self.id else None,
            'name':         self.name,
            'email':        self.email,
            'role':         self.role,
            'role_id':      self.role_id,
            'role_slug':    self.role_slug,
            'avatar':       self.avatar,
            'status':       self.status,
            'is_deleted':   self.is_deleted,
            'permissions':  self.permissions,
            'created_at':   self.created_at.isoformat() if self.created_at else None,
        }
