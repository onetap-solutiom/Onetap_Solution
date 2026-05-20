import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.schema import CreateTable

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database.db import db

# Import all models to ensure they are registered with SQLAlchemy
from models.user_model import User
from models.project_model import Project
from models.service_model import Service
from models.team_model import Team
from models.testimonial_model import Testimonial
from models.contact_model import Contact
from models.newsletter_model import Newsletter

def generate_schema():
    """Generate schema.sql from SQLAlchemy models."""
    app = create_app('development')
    
    with app.app_context():
        # Create a mock engine to generate PostgreSQL schema
        # We don't connect to a real database, just use the dialect
        engine = create_engine('postgresql+psycopg2://postgres:@localhost/postgres')
        
        with open(os.path.join(app.root_path, 'schema.sql'), 'w') as f:
            f.write("-- OneTap Solution Database Schema\n")
            f.write("-- Generated Automatically\n\n")
            
            for table in db.metadata.sorted_tables:
                create_stmt = str(CreateTable(table).compile(engine))
                # Add semicolon at the end
                f.write(create_stmt.strip() + ";\n\n")
                
        print("Schema file 'schema.sql' generated successfully!")

if __name__ == '__main__':
    generate_schema()
