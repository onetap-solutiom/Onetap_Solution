from flask import Blueprint, request
from controllers.stats_controller import get_system_stats, track_visit, get_public_stats
from middleware.auth_middleware import permission_required

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/', methods=['GET'])
@permission_required('view_dashboard')
def get_stats():
    return get_system_stats()

@stats_bp.route('/public', methods=['GET'])
def public_stats():
    return get_public_stats()

@stats_bp.route('/track', methods=['POST'])
def record_visit():
    data = request.json or {}
    ip = request.remote_addr
    agent = request.user_agent.string
    page = data.get('page', '/')
    
    success = track_visit(ip, agent, page)
    return {"success": success}, 201 if success else 500
