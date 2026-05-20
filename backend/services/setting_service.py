from database.db import db
from models.setting_model import Setting
from utils.validators import is_valid_email

class SettingService:
    @staticmethod
    def get_settings():
        """Fetch settings, creating a default entry if not present."""
        settings = Setting.query.first()
        if not settings:
            settings = Setting(
                company_email='info@onetapsolution.com',
                contact_phone='+252 61 9586339',
                office_location='Mogadishu, Somalia',
                projects_done=1,
                trusted_partners=20,
                services_provided=7,
                satisfaction_rate=3
            )
            db.session.add(settings)
            db.session.commit()
        return settings

    @staticmethod
    def update_settings(data):
        """Update global settings with validation."""
        company_email = data.get('company_email')
        contact_phone = data.get('contact_phone')
        office_location = data.get('office_location')

        if not company_email or not contact_phone or not office_location:
            raise ValueError("Email, phone, and office location are required.")

        if not is_valid_email(company_email):
            raise ValueError("Invalid email format.")

        settings = Setting.query.first()
        if not settings:
            settings = Setting()
            db.session.add(settings)

        settings.company_email = company_email.strip()
        settings.contact_phone = contact_phone.strip()
        settings.office_location = office_location.strip()

        try:
            settings.projects_done = int(data.get('projects_done', settings.projects_done))
            settings.trusted_partners = int(data.get('trusted_partners', settings.trusted_partners))
            settings.services_provided = int(data.get('services_provided', settings.services_provided))
            settings.satisfaction_rate = int(data.get('satisfaction_rate', settings.satisfaction_rate))
        except (ValueError, TypeError):
            raise ValueError("Statistics stats must be valid integers.")

        db.session.commit()
        return settings
