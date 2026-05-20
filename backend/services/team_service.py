from database.db import db
from models.team_model import Team

class TeamService:
    @staticmethod
    def get_all(include_deleted=False):
        """Fetch all team members."""
        query = Team.query
        if not include_deleted:
            query = query.filter_by(is_deleted=False)
        return query.order_by(Team.sort_order.asc(), Team.created_at.desc()).all()

    @staticmethod
    def get_by_id(member_id):
        """Fetch a single team member by ID."""
        return Team.query.filter_by(id=member_id, is_deleted=False).first()

    @staticmethod
    def create(data):
        """Create a new team member."""
        name = data.get('name')
        role = data.get('role') or data.get('position')

        if not name or not role:
            raise ValueError("Name and role (position) are required fields.")

        new_member = Team(
            name=name.strip(),
            position=role.strip(),
            image=data.get('image'),
            bio=data.get('bio'),
            linkedin=data.get('linkedin'),
            github=data.get('github'),
            twitter=data.get('twitter'),
            sort_order=data.get('sort_order', 0),
            status=data.get('status', 'Active')
        )

        db.session.add(new_member)
        db.session.commit()
        return new_member

    @staticmethod
    def update(member_id, data):
        """Update a team member's details."""
        member = TeamService.get_by_id(member_id)
        if not member:
            return None

        if 'name' in data:
            member.name = data['name'].strip()
        if 'role' in data:
            member.position = data['role'].strip()
        elif 'position' in data:
            member.position = data['position'].strip()

        if 'image' in data:
            member.image = data['image']
        if 'bio' in data:
            member.bio = data['bio']
        if 'linkedin' in data:
            member.linkedin = data['linkedin']
        if 'github' in data:
            member.github = data['github']
        if 'twitter' in data:
            member.twitter = data['twitter']
        if 'sort_order' in data:
            member.sort_order = data['sort_order']
        if 'status' in data:
            member.status = data['status']

        db.session.commit()
        return member

    @staticmethod
    def delete(member_id):
        """Soft-delete a team member."""
        member = TeamService.get_by_id(member_id)
        if not member:
            return False

        member.is_deleted = True
        db.session.commit()
        return True
