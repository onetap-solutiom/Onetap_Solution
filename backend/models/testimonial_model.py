from database.db import db
from datetime import datetime

class Testimonial(db.Model):
    __tablename__ = 'testimonials'
    
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=True)
    position = db.Column(db.String(100), nullable=True)
    feedback = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, default=5, nullable=False)
    image = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Enum('Published', 'Draft', 'Hidden', name='testimonial_status'), default='Published', nullable=False)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.client_name,
            'role': self.company or self.position or '',
            'review': self.feedback,
            'img': self.image,
            'rating': self.rating,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
