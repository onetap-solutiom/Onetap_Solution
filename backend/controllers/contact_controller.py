from flask import request
from services.contact_service import ContactService
from utils.responses import success_response, error_response

def get_all_messages():
    """Fetch all contact messages."""
    messages = ContactService.get_all()
    return success_response([m.to_dict() for m in messages])

def submit_contact():
    """Submit a new contact message."""
    data = request.get_json(silent=True) or {}
    try:
        ContactService.submit_contact(data)
        return success_response(None, "Message sent successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)

def mark_as_read(message_id):
    """Mark a contact message as read."""
    message = ContactService.mark_as_read(message_id)
    if not message:
        return error_response("Message not found", 404)
    return success_response(message.to_dict(), "Message marked as read")

def delete_message(message_id):
    """Hard-delete a contact message."""
    success = ContactService.delete(message_id)
    if not success:
        return error_response("Message not found", 404)
    return success_response(None, "Message deleted successfully")
