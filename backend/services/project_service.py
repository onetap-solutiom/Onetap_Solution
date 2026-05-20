import json
from database.db import db
from models.project_model import Project
from utils.helpers import slugify
from datetime import datetime

class ProjectService:
    @staticmethod
    def get_all(include_deleted=False):
        """Fetch all projects."""
        query = Project.query
        if not include_deleted:
            query = query.filter_by(is_deleted=False)
        return query.order_by(Project.created_at.desc()).all()

    @staticmethod
    def get_by_id(project_id):
        """Fetch a single project by ID."""
        return Project.query.filter_by(id=project_id, is_deleted=False).first()

    @staticmethod
    def get_by_slug(slug):
        """Fetch a single project by slug."""
        return Project.query.filter_by(slug=slug, is_deleted=False).first()

    @staticmethod
    def create(data):
        """Create a new project."""
        name = data.get('name')
        if not name:
            raise ValueError("Project name is a required field.")

        name = name.strip()
        slug = slugify(name)

        # Ensure slug uniqueness
        existing = Project.query.filter_by(slug=slug, is_deleted=False).first()
        if existing:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

        extra = {
            'deadline': data.get('deadline', ''),
            'progress': data.get('progress', 0),
            'icon': data.get('icon', 'fas fa-code'),
            'description': data.get('description', '')
        }

        new_project = Project(
            title=name,
            slug=slug,
            description=json.dumps(extra),
            image=data.get('image', ''),
            demo_link=data.get('url', ''),
            client=data.get('client', ''),
            category=data.get('category', 'Web Development'),
            status=data.get('status', 'Development')
        )

        db.session.add(new_project)
        db.session.commit()
        return new_project

    @staticmethod
    def update(project_id, data):
        """Update an existing project."""
        project = ProjectService.get_by_id(project_id)
        if not project:
            return None

        # Load existing extra fields from description
        extra = {}
        if project.description:
            try:
                extra = json.loads(project.description)
            except:
                extra = {'description': project.description}

        if 'name' in data:
            project.title = data['name'].strip()
        if 'client' in data:
            project.client = data['client']
        if 'status' in data:
            project.status = data['status']
        if 'category' in data:
            project.category = data['category']
        if 'image' in data:
            project.image = data['image']
        if 'url' in data:
            project.demo_link = data['url']

        # Update extra fields
        if 'deadline' in data:
            extra['deadline'] = data['deadline']
        if 'progress' in data:
            extra['progress'] = data['progress']
        if 'icon' in data:
            extra['icon'] = data['icon']
        if 'description' in data:
            extra['description'] = data['description']

        project.description = json.dumps(extra)
        db.session.commit()
        return project

    @staticmethod
    def delete(project_id):
        """Soft-delete an existing project."""
        project = ProjectService.get_by_id(project_id)
        if not project:
            return False

        project.is_deleted = True
        db.session.commit()
        return True
