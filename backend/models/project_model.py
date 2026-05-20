import json
from database.db import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(170), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.Text, nullable=True)
    github_link = db.Column(db.String(255), nullable=True)
    demo_link = db.Column(db.String(255), nullable=True)
    technologies = db.Column(db.String(255), nullable=True)
    client = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='Development')
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        extra = {}
        if self.description:
            try:
                extra = json.loads(self.description)
            except:
                extra = {'description': self.description}
                
        return {
            'id': self.id,
            'name': self.title,
            'client': self.client,
            'status': self.status,
            'category': self.category,
            'image': self.image,
            'deadline': extra.get('deadline', ''),
            'url': self.demo_link,
            'progress': extra.get('progress', 0),
            'icon': extra.get('icon', 'fas fa-code'),
            'description': extra.get('description', '')
        }
