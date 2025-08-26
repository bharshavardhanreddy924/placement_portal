# auth.py

from functools import wraps
from flask import request, jsonify
import db
from bson import ObjectId
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

# DELETE the old `before_request` function.

def token_required(f):
    """
    Decorator to ensure a valid JWT is present and load the user.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # This function will raise an exception if the token is missing or invalid
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = db.users.find_one({'_id': ObjectId(user_id)})
            
            if not user:
                return jsonify({'error': 'User not found', 'code': 'ERR_NOT_FOUND'}), 404
            
            # Attach the user object to the request context
            request.current_user = user

        except Exception as e:
            return jsonify({'error': 'Token is invalid or expired', 'details': str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated_function


def role_required(required_role):
    """
    Decorator to check user role. Must be used AFTER @token_required.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # request.current_user is now populated by the @token_required decorator
            user = getattr(request, 'current_user', None)
            if not user or user.get('role') != required_role:
                return jsonify({'error': 'Unauthorized for this role', 'code': 'ERR_UNAUTHORIZED'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator