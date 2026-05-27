import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database.db import db
from sqlalchemy import text

def fix_status_constraint():
    app = create_app('development')
    with app.app_context():
        try:
            print("Dropping the restrictive status constraint on projects...")
            db.session.execute(text("ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;"))
            db.session.commit()
            print("Successfully removed the strict constraint. You can now save projects with 'Live' and 'Development' statuses!")
        except Exception as e:
            print(f"Error dropping constraint: {e}")

if __name__ == '__main__':
    fix_status_constraint()
