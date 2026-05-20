from flask import request
from services.newsletter_service import NewsletterService
from utils.responses import success_response, error_response

def get_subscribers():
    """Fetch all newsletter subscribers."""
    subscribers = NewsletterService.get_all()
    return success_response([s.to_dict() for s in subscribers])

def subscribe():
    """Subscribe a new email to the newsletter."""
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    try:
        NewsletterService.subscribe(email)
        return success_response(None, "Successfully subscribed to newsletter", 201)
    except ValueError as e:
        return error_response(str(e), 400)

def delete_subscriber(subscriber_id):
    """Delete a newsletter subscriber."""
    success = NewsletterService.delete(subscriber_id)
    if not success:
        return error_response("Subscriber not found", 404)
    return success_response(None, "Subscriber deleted successfully")
