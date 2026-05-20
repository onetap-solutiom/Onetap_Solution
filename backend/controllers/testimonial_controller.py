from flask import request
from services.testimonial_service import TestimonialService
from utils.responses import success_response, error_response

def get_all_testimonials():
    """Fetch all testimonials."""
    testimonials = TestimonialService.get_all()
    return success_response([t.to_dict() for t in testimonials])

def create_testimonial():
    """Create a new testimonial."""
    data = request.get_json(silent=True) or {}
    try:
        new_testimonial = TestimonialService.create(data)
        return success_response(new_testimonial.to_dict(), "Testimonial created successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)

def update_testimonial(testimonial_id):
    """Update an existing testimonial."""
    data = request.get_json(silent=True) or {}
    try:
        testimonial = TestimonialService.update(testimonial_id, data)
        if not testimonial:
            return error_response("Testimonial not found", 404)
        return success_response(testimonial.to_dict(), "Testimonial updated successfully")
    except ValueError as e:
        return error_response(str(e), 400)

def delete_testimonial(testimonial_id):
    """Delete a testimonial."""
    success = TestimonialService.delete(testimonial_id)
    if not success:
        return error_response("Testimonial not found", 404)
    return success_response(None, "Testimonial deleted successfully")
