import uuid
from database.db import db
from models.user_model import User, Role
from utils.security import hash_password, check_password

ROLE_MAPPING = {
    'superadmin': 1,
    'super admin': 1,
    'admin': 2,
    'editor': 3,
    'employee': 4,
    'viewer': 5
}

class UserService:
    @staticmethod
    def parse_uuid(uuid_str):
        """Safely parse UUID string into uuid.UUID object."""
        if not uuid_str:
            return None
        if isinstance(uuid_str, uuid.UUID):
            return uuid_str
        try:
            return uuid.UUID(uuid_str)
        except ValueError:
            return None

    @staticmethod
    def get_all(include_deleted=False):
        """Fetch all users."""
        query = User.query
        if not include_deleted:
            query = query.filter_by(is_deleted=False)
        return query.all()

    @staticmethod
    def get_by_id(user_id):
        """Fetch user by ID."""
        parsed_id = UserService.parse_uuid(user_id)
        if not parsed_id:
            return None
        return User.query.filter_by(id=parsed_id, is_deleted=False).first()

    @staticmethod
    def get_by_email(email):
        """Fetch user by email (globally, including deleted)."""
        if not email:
            return None
        return User.query.filter_by(email=email.strip().lower()).first()

    @staticmethod
    def create(data):
        """Create a new user or reactivate a soft-deleted one."""
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            raise ValueError("Name, email, and password are required fields.")

        email = email.strip().lower()
        name = name.strip()
        role_name = str(data.get('role', 'Admin')).strip().lower()
        role_id = ROLE_MAPPING.get(role_name, 2)
        hashed = hash_password(password)

        existing_user = UserService.get_by_email(email)
        if existing_user:
            if existing_user.is_deleted:
                # Reactivate soft-deleted user
                existing_user.is_deleted = False
                existing_user.name = name
                existing_user.password_hash = hashed
                existing_user.role_id = role_id
                existing_user.status = data.get('status', 'Active')
                db.session.commit()
                return existing_user, "reactivated"
            else:
                raise ValueError("A user with this email already exists.")

        new_user = User(
            name=name,
            email=email,
            password_hash=hashed,
            role_id=role_id,
            status=data.get('status', 'Active')
        )

        db.session.add(new_user)
        db.session.commit()
        return new_user, "created"

    @staticmethod
    def update(user_id, data):
        """Update an existing user."""
        user = UserService.get_by_id(user_id)
        if not user:
            return None

        if 'name' in data:
            user.name = data['name'].strip()

        if 'email' in data:
            email = data['email'].strip().lower()
            if email != user.email:
                existing = UserService.get_by_email(email)
                if existing and not existing.is_deleted:
                    raise ValueError("A user with this email already exists.")
                user.email = email

        if 'password' in data and data['password']:
            old_password = data.get('old_password', '')
            if not old_password:
                raise ValueError("Current password is required to set a new password.")
            if not check_password(old_password, user.password_hash):
                raise PermissionError("Current password is incorrect.")
            user.password_hash = hash_password(data['password'])

        if 'role' in data:
            role_name = str(data['role']).strip().lower()
            user.role_id = ROLE_MAPPING.get(role_name, 2)

        if 'status' in data:
            user.status = data['status']

        db.session.commit()
        return user

    @staticmethod
    def delete(user_id):
        """Soft-delete a user."""
        user = UserService.get_by_id(user_id)
        if not user:
            return False

        user.is_deleted = True
        db.session.commit()
        return True
