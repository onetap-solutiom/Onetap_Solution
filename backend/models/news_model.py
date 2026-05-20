from database.db import db
from datetime import datetime

class News(db.Model):
    __tablename__ = 'news'
    
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Uuid, db.ForeignKey('users.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), nullable=False, unique=True)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500), nullable=True)
    image = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    tags = db.Column(db.String(500), nullable=True) # comma-separated
    status = db.Column(db.Enum('Published', 'Draft', 'Archived', name='news_status'), default='Draft', nullable=False)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'author_id': str(self.author_id) if self.author_id else None,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'excerpt': self.excerpt,
            'image': self.image,
            'category': self.category,
            'tags': self.tags,
            'status': self.status,
            'is_featured': self.is_featured,
            'view_count': self.view_count,
            'is_deleted': self.is_deleted,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'date': self.created_at.strftime('%b %d, %Y') if self.created_at else '' # Frontend date compatibility
        }
