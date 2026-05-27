import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database.db import db
from sqlalchemy import text

def fix_projects_table():
    app = create_app('development')
    with app.app_context():
        try:
            print("Altering image column to TEXT...")
            db.session.execute(text("ALTER TABLE projects ALTER COLUMN image TYPE TEXT;"))
            
            print("Altering technologies column to TEXT...")
            db.session.execute(text("ALTER TABLE projects ALTER COLUMN technologies TYPE TEXT;"))
            
            db.session.commit()
            print("Successfully updated database schema. The projects table can now accept large Base64 images!")
        except Exception as e:
            print(f"Error executing ALTER TABLE: {e}")

if __name__ == '__main__':
    fix_projects_table()
