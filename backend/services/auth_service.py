from datetime import datetime, timezone
from database.db import db
from models.user_model import User
from models.token_blocklist import TokenBlocklist
from utils.security import check_password

class AuthService:
    @staticmethod
    def verify_credentials(email, password, ip_address=None):
        """Verify user email and password, updating login statistics on success."""
        if not email or not password:
            return None, "Email and password are required."

        user = User.query.filter_by(email=email.strip().lower(), is_deleted=False, status='Active').first()
        if not user or not check_password(password, user.password_hash):
            return None, "Invalid email or password"

        # Check role eligibility (allow all system roles to log in)
        if user.role_slug not in ('superadmin', 'admin', 'editor', 'employee', 'viewer'):
            return None, "Admin access required"

        # Enforce email verification (exempting SuperAdmin to prevent accidental lockout)
        if not user.email_verified and user.role_slug != 'superadmin':
            return None, "Email not verified. Please check your inbox to verify your email."

        # Update last login info
        user.last_login_at = datetime.now(timezone.utc)
        if ip_address:
            user.last_login_ip = ip_address
        db.session.commit()

        return user, None

    @staticmethod
    def block_token(jti):
        """Block a JWT token by adding it to the blocklist."""
        now = datetime.now(timezone.utc)
        blocked = TokenBlocklist(jti=jti, created_at=now)
        db.session.add(blocked)
        db.session.commit()
        return True

    @staticmethod
    def is_token_blocked(jti):
        """Check if a JWT token has been blocklisted."""
        return TokenBlocklist.query.filter_by(jti=jti).first() is not None
