from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user_model import User
from utils.responses import error_response

def admin_required():
    """
    Middleware to ensure the user is logged in and is an Admin.
    Can be used as a decorator for routes.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                # Verify the JWT token is present and valid
                verify_jwt_in_request()
                
                # Get the user ID from the token
                user_id = get_jwt_identity()
                
                # Fetch user from DB
                user = User.query.get(user_id)
                
                if not user:
                    return error_response("User not found", 401)
                    
                # Role check
                if user.role_slug not in ('superadmin', 'admin', 'editor', 'employee', 'viewer'):
                    return error_response("Insufficient permissions. Admin access required.", 403)
                    
            except Exception as e:
                return error_response(f"Authentication failed: {str(e)}", 401)
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def permission_required(permission):
    """
    Middleware to ensure the user is logged in, active, and has the required permission.
    Can be used as a decorator for routes.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                # Verify the JWT token is present and valid
                verify_jwt_in_request()
                
                # Get the user ID from the token
                user_id = get_jwt_identity()
                
                # Fetch user from DB
                user = User.query.get(user_id)
                
                if not user or user.is_deleted or user.status != 'Active':
                    return error_response("User not found or inactive", 401)
                    
                # Bypass check if superadmin or user has "all" permission
                if user.role_slug == 'superadmin' or 'all' in user.permissions:
                    return fn(*args, **kwargs)
                    
                # Verify specific permission
                if permission not in user.permissions:
                    return error_response(f"Insufficient permissions. Requires: {permission}", 403)
                    
            except Exception as e:
                return error_response(f"Authentication failed: {str(e)}", 401)
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper
