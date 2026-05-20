from database.db import db
from datetime import datetime

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(170), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(100), nullable=True)
    sort_order = db.Column(db.Integer, default=0, nullable=False)
    status = db.Column(db.String(20), default='Active')
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, title, slug, description, icon='fas fa-laptop-code', status='Active', sort_order=0):
        self.title = title
        self.slug = slug
        self.description = description
        self.icon = icon
        self.status = status
        self.sort_order = sort_order
        self.is_deleted = False
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.title,
            'slug': self.slug,
            'desc': self.description,
            'icon': self.icon,
            'status': self.status,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


