from flask import Blueprint
from controllers.setting_controller import get_site_settings, update_site_settings
from middleware.auth_middleware import admin_required

setting_bp = Blueprint('settings', __name__)

# Public route to get site settings
setting_bp.route('/', methods=['GET'])(get_site_settings)

# Admin protected route to edit settings
setting_bp.route('/', methods=['PUT'])(admin_required()(update_site_settings))
