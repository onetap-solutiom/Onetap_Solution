import os
import logging
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load environment variables from .env file relative to this file's parent's parent (backend root)
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(backend_dir, '.env'))

class Config:
    """Base configuration."""
    # Flask Secrets
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # Database — Supabase PostgreSQL URI (direct or pooled)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # If DATABASE_URL is not set, fallback to parameters
    if not SQLALCHEMY_DATABASE_URI:
        DB_USER = os.environ.get('DB_USER', 'postgres')
        DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
        DB_HOST = os.environ.get('DB_HOST', 'localhost')
        DB_PORT = os.environ.get('DB_PORT', '5432')
        DB_NAME = os.environ.get('DB_NAME', 'postgres')
        
        # Build standard postgres connection string
        # Use postgresql:// instead of postgres:// (SQLAlchemy requires postgresql://)
        SQLALCHEMY_DATABASE_URI = (
            f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}"
            f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
    else:
        # Standardize postgres:// to postgresql:// for SQLAlchemy compatibility
        if SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)

    # Engine tuning settings for Supabase to handle connection timeouts and pooling
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": int(os.environ.get('DB_POOL_SIZE', 10)),
        "max_overflow": int(os.environ.get('DB_MAX_OVERFLOW', 20)),
        "pool_recycle": int(os.environ.get('DB_POOL_RECYCLE', 1800)),  # 30 minutes
        "pool_pre_ping": True,  # Auto-refresh stale connections
    }
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 7200))  # 2 hours
    JWT_REFRESH_TOKEN_EXPIRES = int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES', 2592000))  # 30 days
    
    # CORS
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    
    # Uploads
    UPLOAD_FOLDER = os.path.join(backend_dir, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'webp'}

class DevelopmentConfig(Config):
    DEBUG = True
    
class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_ENGINE_OPTIONS = {}

class ProductionConfig(Config):
    DEBUG = False
    
    # Secure Cookies
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    def __init__(self):
        # Fail fast in production if required environment secrets are missing
        try:
            self.SECRET_KEY = os.environ['SECRET_KEY']
            self.JWT_SECRET_KEY = os.environ['JWT_SECRET_KEY']
        except KeyError as e:
            raise ValueError(f"Missing essential environment variable in production: {e}")
            
        if self.SECRET_KEY == 'dev-secret-key':
            raise ValueError("SECRET_KEY must be configured securely in production!")
        if self.JWT_SECRET_KEY == 'jwt-dev-secret-key':
            raise ValueError("JWT_SECRET_KEY must be configured securely in production!")

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
