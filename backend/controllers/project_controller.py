from flask import request
from services.project_service import ProjectService
from utils.responses import success_response, error_response

def get_all_projects():
    """Fetch all active projects."""
    projects = ProjectService.get_all()
    return success_response([p.to_dict() for p in projects])

def get_project(project_id):
    """Fetch a single project."""
    project = ProjectService.get_by_id(project_id)
    if not project:
        return error_response("Project not found", 404)
    return success_response(project.to_dict())

def create_project():
    """Create a new project."""
    data = request.get_json(silent=True) or {}
    try:
        new_project = ProjectService.create(data)
        return success_response(new_project.to_dict(), "Project created successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)

def update_project(project_id):
    """Update an existing project."""
    data = request.get_json(silent=True) or {}
    try:
        project = ProjectService.update(project_id, data)
        if not project:
            return error_response("Project not found", 404)
        return success_response(project.to_dict(), "Project updated successfully")
    except ValueError as e:
        return error_response(str(e), 400)

def delete_project(project_id):
    """Soft-delete a project."""
    success = ProjectService.delete(project_id)
    if not success:
        return error_response("Project not found", 404)
    return success_response(None, "Project deleted successfully")
