from flask import request
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, get_jwt, jwt_required
from datetime import datetime, timezone, timedelta
import logging

from services.auth_service import AuthService
from services.user_service import UserService
from utils.responses import success_response, error_response
from utils.validators import require_fields, is_valid_email, is_valid_password

logger = logging.getLogger('security')

# Simple in-memory rate limiter to prevent brute-force attacks
failed_logins = {}

def login():
    """Authenticate admin users and generate tokens."""
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ['email', 'password'])
    if missing:
        return error_response(f"Missing fields: {', '.join(missing)}", 400)

    email    = data['email'].strip().lower()
    password = data['password'].strip()
    
    if not is_valid_email(email):
        logger.warning(f"Invalid email format attempted: {email} from IP {request.remote_addr}")
        return error_response("Invalid email format", 400)
        
    if not is_valid_password(password):
        logger.warning(f"Invalid password format attempted for email: {email} from IP {request.remote_addr}")
        return error_response("Invalid email or password", 401)
        
    ip       = request.remote_addr
    now      = datetime.now(timezone.utc)

    # Check rate limit
    if ip in failed_logins:
        attempts, locked_until = failed_logins[ip]
        if locked_until and now < locked_until:
            return error_response("Too many failed attempts. Try again later.", 429)
        elif locked_until and now >= locked_until:
            failed_logins[ip] = [0, None]

    # Verify credentials via AuthService
    user, err = AuthService.verify_credentials(email, password, ip_address=ip)
    if err:
        # Increment failed attempts
        if ip not in failed_logins:
            failed_logins[ip] = [0, None]
        failed_logins[ip][0] += 1
        
        if failed_logins[ip][0] >= 5:
            failed_logins[ip][1] = now + timedelta(minutes=15)
            logger.warning(f"BRUTE FORCE PROTECTION TRIGGERED: IP {ip} locked out for 15 minutes.")
            
        logger.warning(f"Failed login attempt for {email} from IP {ip}: {err}")
        status_code = 403 if "access required" in err.lower() else 401
        return error_response(err, status_code)

    # On success, clear attempts
    if ip in failed_logins:
        del failed_logins[ip]

    logger.info(f"Successful admin login for {email} from IP {ip}")

    # Create JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return success_response({
        'token': access_token,
        'refresh_token': refresh_token,
        'user':  user.to_dict()
    }, "Login successful")

@jwt_required(refresh=True)
def refresh():
    """Refresh the access token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return success_response({'token': access_token}, "Token refreshed")

@jwt_required()
def logout():
    """Revoke the current access token."""
    jti = get_jwt()["jti"]
    AuthService.block_token(jti)
    logger.info(f"User {get_jwt_identity()} logged out successfully")
    return success_response(None, "Successfully logged out")

@jwt_required()
def get_current_user():
    """Retrieve details for the currently logged-in user."""
    user_id = get_jwt_identity()
    user = UserService.get_by_id(user_id)

    if not user or user.is_deleted:
        return error_response("User not found", 404)

    return success_response({'user': user.to_dict()})
