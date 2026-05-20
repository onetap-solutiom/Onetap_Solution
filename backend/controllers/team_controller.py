from flask import request
from services.team_service import TeamService
from utils.responses import success_response, error_response

def get_all_team():
    """Fetch all active team members."""
    team = TeamService.get_all()
    return success_response([t.to_dict() for t in team])

def create_team_member():
    """Add a new team member."""
    data = request.get_json(silent=True) or {}
    try:
        new_member = TeamService.create(data)
        return success_response(new_member.to_dict(), "Team member added successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)

def update_team_member(member_id):
    """Update a team member's details."""
    data = request.get_json(silent=True) or {}
    try:
        member = TeamService.update(member_id, data)
        if not member:
            return error_response("Team member not found", 404)
        return success_response(member.to_dict(), "Team member updated successfully")
    except ValueError as e:
        return error_response(str(e), 400)

def delete_team_member(member_id):
    """Soft-delete a team member."""
    success = TeamService.delete(member_id)
    if not success:
        return error_response("Team member not found", 404)
    return success_response(None, "Team member deleted successfully")
