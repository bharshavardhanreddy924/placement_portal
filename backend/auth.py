from functools import wraps
from flask import request, jsonify
import db
import os
from bson import ObjectId

def before_request():
    if request.endpoint in ['static', None]:
        return
    
    user_type = request.headers.get('X-User', 'student')
    
    demo_emails = {
        'student': os.getenv('DEMO_EMAIL_STUDENT', 'student@demo.in'),
        'coordinator': os.getenv('DEMO_EMAIL_COORD', 'coord@demo.in')
    }
    
    email = demo_emails.get(user_type, demo_emails['student'])
    
    user = db.users.find_one({'email': email})
    if user:
        user['_id'] = ObjectId(user['_id'])
        request.current_user = user

def role_required(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = getattr(request, 'current_user', None)
            if not user or user.get('role') != required_role:
                return jsonify({'error': 'Unauthorized', 'code': 'ERR_UNAUTHORIZED'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator