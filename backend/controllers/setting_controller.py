from flask import request
from services.setting_service import SettingService
from utils.responses import success_response, error_response

def get_site_settings():
    """Retrieve global site settings."""
    settings = SettingService.get_settings()
    return success_response(settings.to_dict())

def update_site_settings():
    """Update global site settings."""
    data = request.get_json(silent=True) or {}
    try:
        settings = SettingService.update_settings(data)
        return success_response(settings.to_dict(), "Settings updated successfully")
    except ValueError as e:
        return error_response(str(e), 400)
