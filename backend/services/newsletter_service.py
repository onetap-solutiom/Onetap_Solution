from database.db import db
from models.newsletter_model import Newsletter
from utils.validators import is_valid_email

class NewsletterService:
    @staticmethod
    def get_all():
        """Fetch all subscribers."""
        return Newsletter.query.order_by(Newsletter.subscribed_at.desc()).all()

    @staticmethod
    def get_by_id(subscriber_id):
        """Fetch a subscriber by ID."""
        return Newsletter.query.get(subscriber_id)

    @staticmethod
    def subscribe(email):
        """Subscribe email to the newsletter."""
        if not email:
            raise ValueError("Email is a required field.")

        email = email.strip().lower()
        if not is_valid_email(email):
            raise ValueError("Invalid email format.")

        existing = Newsletter.query.filter_by(email=email).first()
        if existing:
            raise ValueError("Email already subscribed.")

        new_sub = Newsletter(email=email)
        db.session.add(new_sub)
        db.session.commit()
        return new_sub

    @staticmethod
    def delete(subscriber_id):
        """Delete a subscriber."""
        subscriber = NewsletterService.get_by_id(subscriber_id)
        if not subscriber:
            return False

        db.session.delete(subscriber)
        db.session.commit()
        return True
