from database.db import db
from models.contact_model import Contact
from utils.validators import is_valid_email

class ContactService:
    @staticmethod
    def get_all():
        """Fetch all contact messages."""
        return Contact.query.order_by(Contact.created_at.desc()).all()

    @staticmethod
    def get_by_id(message_id):
        """Fetch a single contact message by ID."""
        return Contact.query.get(message_id)

    @staticmethod
    def submit_contact(data):
        """Submit a contact message."""
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        if not name or not email or not message:
            raise ValueError("Name, email, and message are required fields.")

        if not is_valid_email(email):
            raise ValueError("Invalid email format.")

        new_message = Contact(
            name=name.strip(),
            email=email.strip().lower(),
            subject=data.get('subject', '').strip(),
            message=message.strip()
        )

        db.session.add(new_message)
        db.session.commit()
        return new_message

    @staticmethod
    def mark_as_read(message_id):
        """Mark a message as read."""
        message = ContactService.get_by_id(message_id)
        if not message:
            return None

        message.is_read = True
        db.session.commit()
        return message

    @staticmethod
    def delete(message_id):
        """Hard-delete a contact message."""
        message = ContactService.get_by_id(message_id)
        if not message:
            return False

        db.session.delete(message)
        db.session.commit()
        return True
