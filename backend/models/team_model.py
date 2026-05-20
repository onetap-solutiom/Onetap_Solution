from database.db import db
from datetime import datetime

class Team(db.Model):
    __tablename__ = 'team'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    image = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    linkedin = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)
    twitter = db.Column(db.String(255), nullable=True)
    sort_order = db.Column(db.Integer, default=0, nullable=False)
    status = db.Column(db.String(20), default='Active')
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.position, # Map position to role for frontend compatibility
            'image': self.image,
            'bio': self.bio,
            'linkedin': self.linkedin,
            'github': self.github,
            'twitter': self.twitter,
            'status': self.status,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
