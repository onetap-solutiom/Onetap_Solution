from flask import Blueprint
from controllers.user_controller import (
    get_all_users, create_user,
    update_user, delete_user
)
from middleware.auth_middleware import permission_required

user_bp = Blueprint('users', __name__)
user_bp.strict_slashes = False

# User management routes require specific permissions
user_bp.route('/', methods=['GET'])(permission_required('view_users')(get_all_users))
user_bp.route('/', methods=['POST'])(permission_required('create_user')(create_user))
user_bp.route('/<string:user_id>', methods=['PUT'])(permission_required('edit_user')(update_user))
user_bp.route('/<string:user_id>', methods=['DELETE'])(permission_required('delete_user')(delete_user))
