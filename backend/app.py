import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Import configurations
from config import config

# Import database and migrate
from database.db import db, migrate

# Import Error Handlers
from middleware.error_handler import register_error_handlers

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.project_routes import project_bp
from routes.service_routes import service_bp
from routes.contact_routes import contact_bp
from routes.team_routes import team_bp
from routes.testimonial_routes import testimonial_bp
from routes.newsletter_routes import newsletter_bp
from routes.user_routes import user_bp
from routes.news_routes import news_bp
from routes.stats_routes import stats_bp
from routes.setting_routes import setting_bp
from models.visit_model import Visit
from models.setting_model import Setting


def create_app(config_name='default'):
    """Factory function to create and configure the Flask app."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": app.config.get('FRONTEND_URL', '*')}})
    
    # Initialize Database and Migrate
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Auto-create tables (e.g. visits)
    with app.app_context():
        db.create_all()
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Create uploads directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register Error Handlers
    register_error_handlers(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(service_bp, url_prefix='/api/services')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')
    app.register_blueprint(team_bp, url_prefix='/api/team')
    app.register_blueprint(testimonial_bp, url_prefix='/api/testimonials')
    app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(news_bp, url_prefix='/api/news')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(setting_bp, url_prefix='/api/settings')
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {"success": True, "message": "Backend is running flawlessly."}, 200
        
    return app

# Determine environment
env = os.environ.get('FLASK_ENV', 'development')
app = create_app(env)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
