from database.db import db
from models.news_model import News
from utils.helpers import slugify
from datetime import datetime

class NewsService:
    @staticmethod
    def get_all(include_deleted=False):
        """Fetch all news posts."""
        query = News.query
        if not include_deleted:
            query = query.filter_by(is_deleted=False)
        return query.order_by(News.created_at.desc()).all()

    @staticmethod
    def get_by_id(news_id):
        """Fetch a single news article by ID."""
        return News.query.filter_by(id=news_id, is_deleted=False).first()

    @staticmethod
    def get_by_slug(slug):
        """Fetch a single news article by slug."""
        return News.query.filter_by(slug=slug, is_deleted=False).first()

    @staticmethod
    def create(data, author_id=None):
        """Create a new article."""
        title = data.get('title')
        content = data.get('content')

        if not title or not content:
            raise ValueError("Title and content are required fields.")

        title = title.strip()
        slug = data.get('slug', '').strip() or slugify(title)

        # Ensure slug uniqueness
        existing = News.query.filter_by(slug=slug, is_deleted=False).first()
        if existing:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

        status = data.get('status', 'Draft')
        published_at = datetime.utcnow() if status == 'Published' else None

        new_article = News(
            author_id=author_id,
            title=title,
            content=content,
            slug=slug,
            excerpt=data.get('excerpt', ''),
            image=data.get('image', ''),
            category=data.get('category', 'General'),
            tags=data.get('tags', ''),
            status=status,
            is_featured=bool(data.get('is_featured', False)),
            published_at=published_at
        )

        db.session.add(new_article)
        db.session.commit()
        return new_article

    @staticmethod
    def update(news_id, data):
        """Update an existing article."""
        news = NewsService.get_by_id(news_id)
        if not news:
            return None

        if 'title' in data:
            news.title = data['title'].strip()
        if 'content' in data:
            news.content = data['content']
        if 'slug' in data and data['slug'].strip():
            news.slug = data['slug'].strip()
        if 'excerpt' in data:
            news.excerpt = data['excerpt']
        if 'image' in data:
            news.image = data['image']
        if 'category' in data:
            news.category = data['category']
        if 'tags' in data:
            news.tags = data['tags']
        if 'status' in data:
            old_status = news.status
            news.status = data['status']
            if data['status'] == 'Published' and old_status != 'Published':
                news.published_at = datetime.utcnow()
        if 'is_featured' in data:
            news.is_featured = bool(data['is_featured'])

        db.session.commit()
        return news

    @staticmethod
    def delete(news_id):
        """Soft-delete an existing article."""
        news = NewsService.get_by_id(news_id)
        if not news:
            return False

        news.is_deleted = True
        db.session.commit()
        return True

    @staticmethod
    def increment_view_count(news_id):
        """Increment view count for a news article."""
        news = NewsService.get_by_id(news_id)
        if news:
            news.view_count += 1
            db.session.commit()
            return True
        return False
