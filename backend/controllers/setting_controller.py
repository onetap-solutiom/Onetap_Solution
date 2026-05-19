from flask import request
from database.db import db
from models.setting_model import Setting
from utils.responses import success_response, error_response
from utils.validators import require_fields, is_valid_email

def get_site_settings():
    settings = Setting.query.first()
    if not settings:
        settings = Setting()
        settings.company_email = 'info@onetapsolution.com'
        settings.contact_phone = '+252 61 9586339'
        settings.office_location = 'Mogadishu, Somalia'
        db.session.add(settings)
        db.session.commit()
    return success_response(settings.to_dict())

def update_site_settings():
    data = request.get_json()
    missing = require_fields(data, ['company_email', 'contact_phone', 'office_location'])
    if missing:
        return error_response(f"Missing required fields: {', '.join(missing)}")
        
    if not is_valid_email(data['company_email']):
        return error_response("Invalid email format")
        
    settings = Setting.query.first()
    if not settings:
        settings = Setting()
        settings.company_email = data['company_email']
        settings.contact_phone = data['contact_phone']
        settings.office_location = data['office_location']
        db.session.add(settings)
    else:
        settings.company_email = data['company_email']
        settings.contact_phone = data['contact_phone']
        settings.office_location = data['office_location']
        
    db.session.commit()
    return success_response(settings.to_dict(), "Settings updated successfully")
