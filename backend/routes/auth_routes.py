from flask import Blueprint
from controllers.auth_controller import login, get_current_user, refresh, logout, verify_email
from middleware.auth_middleware import admin_required
from middleware.rate_limiter import limiter

auth_bp = Blueprint('auth', __name__)

auth_bp.route('/login', methods=['POST'])(limiter.limit("5 per minute")(login))
auth_bp.route('/me', methods=['GET'])(admin_required()(get_current_user))
auth_bp.route('/refresh', methods=['POST'])(limiter.limit("5 per minute")(refresh))
auth_bp.route('/logout', methods=['POST'])(logout)
auth_bp.route('/verify-email', methods=['GET'])(verify_email)
