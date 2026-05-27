from database.db import db
from datetime import datetime

class Visit(db.Model):
    __tablename__ = 'visits'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.String(500))
    page_visited = db.Column(db.String(255), nullable=False, default='/')
    visited_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __init__(self, ip_address, user_agent=None, page_visited='/'):
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.page_visited = page_visited

    def to_dict(self):
        return {
            'id': self.id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'page_visited': self.page_visited,
            'visited_at': self.visited_at.isoformat() if self.visited_at else None
        }
