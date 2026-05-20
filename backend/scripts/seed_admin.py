import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database.db import db
from models.user_model import User
from utils.security import hash_password

def seed_admin():
    """Seed the database with an initial Super Admin user."""
    app = create_app('development')
    
    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()
        
        # Check if admin already exists
        admin_email = 'admin@onetap.com'
        existing_admin = User.query.filter_by(email=admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists with email: {admin_email}")
            return
            
        # Create new admin user
        print(f"Creating Super Admin user: {admin_email} / admin123")
        hashed_password = hash_password('admin123')
        
        admin_user = User(
            name='OneTap Admin',
            email=admin_email,
            password_hash=hashed_password,
            role='Super Admin',
            email_verified=True   # SuperAdmin is pre-verified
        )
        
        db.session.add(admin_user)
        db.session.commit()
        
        print("Super Admin user created successfully!")
        print("You can now login with:")
        print("Email: admin@onetap.com")
        print("Password: admin123")
        print("Make sure to change the password after first login.")

if __name__ == '__main__':
    seed_admin()
