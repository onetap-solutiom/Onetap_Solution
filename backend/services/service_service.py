from database.db import db
from models.service_model import Service
from utils.helpers import slugify
from datetime import datetime

class ServiceService:
    @staticmethod
    def get_all(include_deleted=False):
        """Fetch all services, optionally filtering out deleted ones."""
        query = Service.query
        if not include_deleted:
            query = query.filter_by(is_deleted=False)
        return query.order_by(Service.sort_order.asc(), Service.created_at.desc()).all()

    @staticmethod
    def get_by_id(service_id):
        """Fetch a single service by ID."""
        return Service.query.filter_by(id=service_id, is_deleted=False).first()

    @staticmethod
    def get_by_slug(slug):
        """Fetch a single service by slug."""
        return Service.query.filter_by(slug=slug, is_deleted=False).first()

    @staticmethod
    def create(data):
        """Create a new service."""
        title = data.get('title') or data.get('name')
        description = data.get('description') or data.get('desc')
        icon = data.get('icon', 'fas fa-laptop-code')
        status = data.get('status', 'Active')
        sort_order = data.get('sort_order', 0)

        if not title or not description:
            raise ValueError("Title (name) and description (desc) are required fields.")

        slug = slugify(title)
        # Ensure slug uniqueness
        existing = Service.query.filter_by(slug=slug).first()
        if existing:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

        new_service = Service(
            title=title.strip(),
            slug=slug,
            description=description.strip(),
            icon=icon,
            status=status,
            sort_order=sort_order
        )

        db.session.add(new_service)
        db.session.commit()
        return new_service

    @staticmethod
    def update(service_id, data):
        """Update an existing service."""
        service = ServiceService.get_by_id(service_id)
        if not service:
            return None

        title = data.get('title') or data.get('name')
        description = data.get('description') or data.get('desc')

        if title:
            service.title = title.strip()
            # Optionally regenerate slug if title changes
            # service.slug = slugify(title)
        if description:
            service.description = description.strip()
        if 'icon' in data:
            service.icon = data['icon']
        if 'status' in data:
            service.status = data['status']
        if 'sort_order' in data:
            service.sort_order = data['sort_order']

        db.session.commit()
        return service

    @staticmethod
    def delete(service_id):
        """Soft-delete an existing service."""
        service = ServiceService.get_by_id(service_id)
        if not service:
            return False

        service.is_deleted = True
        db.session.commit()
        return True
