from flask import request
from services.service_service import ServiceService
from utils.responses import success_response, error_response

def get_all_services():
    """Fetch all active services."""
    services = ServiceService.get_all()
    return success_response([s.to_dict() for s in services])

def create_service():
    """Create a new service."""
    data = request.get_json(silent=True) or {}
    try:
        new_service = ServiceService.create(data)
        return success_response(new_service.to_dict(), "Service created successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)

def update_service(service_id):
    """Update an existing service."""
    data = request.get_json(silent=True) or {}
    try:
        service = ServiceService.update(service_id, data)
        if not service:
            return error_response("Service not found", 404)
        return success_response(service.to_dict(), "Service updated successfully")
    except ValueError as e:
        return error_response(str(e), 400)

def delete_service(service_id):
    """Soft-delete a service."""
    success = ServiceService.delete(service_id)
    if not success:
        return error_response("Service not found", 404)
    return success_response(None, "Service deleted successfully")
