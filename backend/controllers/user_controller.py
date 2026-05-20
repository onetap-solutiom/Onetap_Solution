from flask import request
from flask_jwt_extended import get_jwt_identity
from services.user_service import UserService
from utils.responses import success_response, error_response

def get_all_users():
    """Fetch all active users."""
    users = UserService.get_all()
    return success_response([u.to_dict() for u in users])

def create_user():
    """Create a new user or reactivate a deleted one."""
    data = request.get_json(silent=True) or {}
    try:
        new_user, action = UserService.create(data)
        msg = "User created successfully" if action == "created" else "User reactivated successfully"
        status = 201 if action == "created" else 200
        return success_response(new_user.to_dict(), msg, status)
    except ValueError as e:
        # Conflict or Bad request
        if "already exists" in str(e):
            return error_response(str(e), 409)
        return error_response(str(e), 400)

def update_user(user_id):
    """Update user information."""
    data = request.get_json(silent=True) or {}
    current_user_id = get_jwt_identity()

    # Guardrail: Prevent self-modification that causes lockout or loss of admin privilege
    if str(user_id).strip().lower() == str(current_user_id).strip().lower():
        if 'status' in data and data['status'] != 'Active':
            return error_response("You cannot deactivate or suspend your own account.", 400)
        if 'role' in data:
            return error_response("You cannot change your own role.", 400)

    try:
        user = UserService.update(user_id, data)
        if not user:
            return error_response("User not found", 404)
        return success_response(user.to_dict(), "User updated successfully")
    except ValueError as e:
        if "already exists" in str(e):
            return error_response(str(e), 409)
        return error_response(str(e), 400)
    except PermissionError as e:
        return error_response(str(e), 401)

def delete_user(user_id):
    """Soft-delete a user."""
    current_user_id = get_jwt_identity()

    # Guardrail: Prevent self-deletion
    if str(user_id).strip().lower() == str(current_user_id).strip().lower():
        return error_response("You cannot delete your own account.", 400)

    success = UserService.delete(user_id)
    if not success:
        return error_response("User not found", 404)
    return success_response(None, "User deleted successfully")
