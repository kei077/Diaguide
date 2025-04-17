from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

class IsAuthorOrReadOnly(permissions.BasePermission):
    message = 'Only the author can modify or delete this content.'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if obj.auteur != request.user:
            raise PermissionDenied(self.message)
        return True
