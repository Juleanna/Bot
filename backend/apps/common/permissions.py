from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Object-level permission: only the owner can access."""

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsAdmin(BasePermission):
    """Only platform admins (staff or in Admin group)."""

    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff
            or request.user.groups.filter(name="Admin").exists()
        )
