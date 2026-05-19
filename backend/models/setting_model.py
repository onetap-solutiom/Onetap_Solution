from database.db import db
from datetime import datetime

class Setting(db.Model):
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_email = db.Column(db.String(120), nullable=False, default='info@onetapsolution.com')
    contact_phone = db.Column(db.String(30), nullable=False, default='+252 61 9586339')
    office_location = db.Column(db.String(255), nullable=False, default='Mogadishu, Somalia')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'company_email': self.company_email,
            'contact_phone': self.contact_phone,
            'office_location': self.office_location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
