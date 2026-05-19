import os
import logging
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load environment variables from .env file relative to this file
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(backend_dir, '.env'))

class Config:
    """Base configuration."""
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # Database — support DATABASE_URL (Render/Railway/PlanetScale) or individual vars
    _database_url = os.environ.get('DATABASE_URL', '')
    if _database_url:
        # Some providers give postgres:// — ensure mysql+pymysql for MySQL URLs
        if _database_url.startswith('mysql://'):
            _database_url = _database_url.replace('mysql://', 'mysql+pymysql://', 1)
        SQLALCHEMY_DATABASE_URI = _database_url
    else:
        DB_USER = os.environ.get('DB_USER', 'root')
        DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
        DB_HOST = os.environ.get('DB_HOST', 'localhost')
        DB_PORT = os.environ.get('DB_PORT', '3306')
        DB_NAME = os.environ.get('DB_NAME', 'onetap_db')
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{DB_USER}:{quote_plus(DB_PASSWORD)}"
            f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 7200  # 2 hours in seconds
    
    # CORS
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    
    # Uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'webp'}

class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False
    
    # Secure Cookies
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # In production, ensure secure settings
    def __init__(self):
        # Fail fast if essential secrets are missing
        try:
            self.SECRET_KEY = os.environ['SECRET_KEY']
            self.JWT_SECRET_KEY = os.environ['JWT_SECRET_KEY']
        except KeyError as e:
            raise ValueError(f"Missing essential environment variable in production: {e}")
            
        if self.SECRET_KEY == 'dev-secret-key':
            raise ValueError("SECRET_KEY must be configured securely in production!")
        if self.JWT_SECRET_KEY == 'jwt-dev-secret-key':
            raise ValueError("JWT_SECRET_KEY must be configured securely in production!")
        
        # Warn if using root — don't block (some managed DBs use root by default)
        db_user = os.environ.get('DB_USER', 'root')
        if db_user == 'root':
            logging.warning(
                "WARNING: Using 'root' DB user in production. "
                "Consider a least-privilege user for better security."
            )

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
