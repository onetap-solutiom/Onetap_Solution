from database.db import db
from models.testimonial_model import Testimonial

class TestimonialService:
    @staticmethod
    def get_all():
        """Fetch all testimonials."""
        return Testimonial.query.order_by(Testimonial.created_at.desc()).all()

    @staticmethod
    def get_by_id(testimonial_id):
        """Fetch a single testimonial by ID."""
        return Testimonial.query.get(testimonial_id)

    @staticmethod
    def create(data):
        """Create a new testimonial."""
        client_name = data.get('name') or data.get('client_name')
        feedback = data.get('review') or data.get('feedback')
        company = data.get('role') or data.get('company')
        image = data.get('img') or data.get('image')
        rating = data.get('rating', 5)
        status = data.get('status', 'Published')

        if not client_name or not feedback:
            raise ValueError("Client name (name) and feedback (review) are required fields.")

        new_testimonial = Testimonial(
            client_name=client_name.strip(),
            company=company.strip() if company else None,
            feedback=feedback.strip(),
            image=image,
            rating=int(rating),
            status=status,
            is_featured=bool(data.get('is_featured', False))
        )

        db.session.add(new_testimonial)
        db.session.commit()
        return new_testimonial

    @staticmethod
    def update(testimonial_id, data):
        """Update an existing testimonial."""
        testimonial = TestimonialService.get_by_id(testimonial_id)
        if not testimonial:
            return None

        client_name = data.get('name') or data.get('client_name')
        feedback = data.get('review') or data.get('feedback')
        company = data.get('role') or data.get('company')
        image = data.get('img') or data.get('image')

        if client_name:
            testimonial.client_name = client_name.strip()
        if feedback:
            testimonial.feedback = feedback.strip()
        if company:
            testimonial.company = company.strip()
        if image is not None:
            testimonial.image = image
        if 'rating' in data:
            testimonial.rating = int(data['rating'])
        if 'status' in data:
            testimonial.status = data['status']
        if 'is_featured' in data:
            testimonial.is_featured = bool(data['is_featured'])

        db.session.commit()
        return testimonial

    @staticmethod
    def delete(testimonial_id):
        """Hard-delete a testimonial."""
        testimonial = TestimonialService.get_by_id(testimonial_id)
        if not testimonial:
            return False

        db.session.delete(testimonial)
        db.session.commit()
        return True
