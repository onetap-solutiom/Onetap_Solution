from flask import request
from flask_jwt_extended import get_jwt_identity
from services.news_service import NewsService
from utils.responses import success_response, error_response

def get_all_news():
    """Fetch all articles."""
    news_list = NewsService.get_all()
    return success_response([n.to_dict() for n in news_list])

def get_news_by_id(news_id):
    """Fetch a single news article."""
    news = NewsService.get_by_id(news_id)
    if not news:
        return error_response("Article not found", 404)
    # Increment view count
    NewsService.increment_view_count(news_id)
    return success_response(news.to_dict())

def create_news():
    """Create a new article."""
    data = request.get_json(silent=True) or {}
    author_id = get_jwt_identity() # Extract user ID from JWT if route is protected
    try:
        new_article = NewsService.create(data, author_id=author_id)
        return success_response(new_article.to_dict(), "Article created successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)

def update_news(news_id):
    """Update an existing article."""
    data = request.get_json(silent=True) or {}
    try:
        news = NewsService.update(news_id, data)
        if not news:
            return error_response("Article not found", 404)
        return success_response(news.to_dict(), "Article updated successfully")
    except ValueError as e:
        return error_response(str(e), 400)

def delete_news(news_id):
    """Soft-delete an article."""
    success = NewsService.delete(news_id)
    if not success:
        return error_response("Article not found", 404)
    return success_response(None, "Article deleted successfully")
