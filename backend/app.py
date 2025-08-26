from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, JWTManager
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv
import db
from auth import role_required, token_required
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
# Allow your React app to communicate with this backend
CORS(app, origins=["http://localhost:5173"]) 

# Setup JWT and Bcrypt
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-it")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# --- AUTHENTICATION ROUTES ---
# app.py
# app.py

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'student')

    if not email or not password or not name:
        return jsonify({"error": "Missing fields"}), 400

    if role == 'coordinator':
        existing_coordinator = db.users.find_one({'role': 'coordinator'})
        if existing_coordinator:
            return jsonify({"error": "A coordinator account already exists."}), 403

    existing_user = db.users.find_one({'email': email})
    if existing_user:
        return jsonify({"error": "Email already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # NEW: Create a full user document with default empty fields
    new_user = {
        'email': email,
        'password': hashed_password,
        'name': name,
        'role': role,
        'created_at': datetime.now(timezone.utc),
        'updated_at': datetime.now(timezone.utc),
        
        # Add all other profile fields with default values
        'phone': None,
        'gender': None,
        'dob': None,
        'degree': None,
        'branch': None,
        'college': None,
        'ug_percentage': None,
        'ug_cgpa': None,
        'ug_yop': None,
        'tenth_percentage': None,
        'tenth_yop': None,
        'twelfth_percentage': None,
        'twelfth_yop': None,
        'has_internship': False,
        'standing_backlogs': False,
        'resume_url': None,
        'skills': [],
        'links': {
            'github': None,
            'linkedin': None
        },
        'experience': []
    }
    
    result = db.users.insert_one(new_user)
    
    access_token = create_access_token(identity=str(result.inserted_id))
    
    created_user = db.users.find_one({'_id': result.inserted_id})
    created_user['_id'] = str(created_user['_id'])
    del created_user['password']

    return jsonify(access_token=access_token, user=created_user), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400
    
    user = db.users.find_one({'email': email})

    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['_id']))
        user['_id'] = str(user['_id'])
        del user['password']
        return jsonify(access_token=access_token, user=user)
    
    return jsonify({"error": "Invalid credentials"}), 401

# --- USER PROFILE ROUTES ---

@app.route('/me', methods=['GET'])
@token_required
def get_profile():
    user = request.current_user
    user['_id'] = str(user['_id'])
    if 'password' in user:
        del user['password']
    return jsonify(user)
# app.py
# app.py

@app.route('/me', methods=['PUT'])
@token_required
def update_profile():
    user = request.current_user # This user object is from the database
    data = request.get_json()
    
    allowed_fields = ['name', 'phone', 'gender', 'dob', 'branch', 'ug_percentage', 
                     'ug_cgpa', 'ug_yop', 'tenth_percentage', 'tenth_yop',
                     'twelfth_percentage', 'twelfth_yop', 'diploma_percentage',
                     'diploma_yop', 'has_internship', 'standing_backlogs',
                     'resume_url', 'skills', 'links']
    
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    # THE FIX IS HERE: We use user['_id'] directly without ObjectId()
    db.users.update_one(
        {'_id': user['_id']}, 
        {'$set': update_data}
    )
    
    # We also fix the find_one call here for consistency
    updated_user = db.users.find_one({'_id': user['_id']})
    
    updated_user['_id'] = str(updated_user['_id'])
    if 'password' in updated_user:
        del updated_user['password']
    return jsonify(updated_user)

@app.route('/me/experience', methods=['POST'])
@token_required # DECORATOR ADDED: User must be logged in to add experience
def add_experience():
    user = request.current_user
    data = request.get_json()
    
    experience = {
        '_id': ObjectId(), # Assign a unique ID for easier updates/deletes
        'type': data.get('type'),
        'company': data.get('company'),
        'title': data.get('title'),
        'location': data.get('location'),
        'start_date': data.get('start_date'),
        'end_date': data.get('end_date'),
        'is_current': data.get('is_current', False),
        'summary': data.get('summary'),
        'technologies': data.get('technologies', []),
        'achievements': data.get('achievements', []),
        'links': data.get('links', []),
        'proof': data.get('proof')
    }
    
    db.users.update_one(
        {'_id': user['_id']},
        {'$push': {'experience': experience}}
    )
    
    return jsonify({'message': 'Experience added successfully'}), 201

@app.route('/me/experience/<exp_id>', methods=['PUT'])
@token_required # DECORATOR ADDED: User must be logged in to update experience
def update_experience(exp_id):
    user = request.current_user
    data = request.get_json()
    
    update_fields = {}
    for field in ['type', 'company', 'title', 'location', 'start_date', 'end_date', 
                  'is_current', 'summary', 'technologies', 'achievements', 'links', 'proof']:
        if field in data:
            update_fields[f'experience.$.{field}'] = data[field]
    
    result = db.users.update_one(
        {'_id': user['_id'], 'experience._id': ObjectId(exp_id)}, 
        {'$set': update_fields}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'Experience not found'}), 404
    
    return jsonify({'message': 'Experience updated successfully'})

@app.route('/me/experience/<exp_id>', methods=['DELETE'])
@token_required # DECORATOR ADDED: User must be logged in to delete experience
def delete_experience(exp_id):
    user = request.current_user
    
    result = db.users.update_one(
        {'_id': user['_id']},
        {'$pull': {'experience': {'_id': ObjectId(exp_id)}}}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'Experience not found'}), 404
    
    return jsonify({'message': 'Experience deleted successfully'})

# --- JOB ROUTES ---

@app.route('/jobs', methods=['GET'])
def get_jobs():
    query = {}
    
    # ... (rest of the function logic is fine for a public route) ...
    search_query = request.args.get('q', '')
    if search_query:
        query['$or'] = [
            {'title': {'$regex': search_query, '$options': 'i'}},
            {'company': {'$regex': search_query, '$options': 'i'}},
            {'tech_stack': {'$in': [search_query]}}
        ]
    
    if request.args.get('before_deadline', 'true').lower() == 'true':
        query['deadline'] = {'$gte': datetime.now(timezone.utc)}
    
    jobs = list(db.jobs.find(query).sort('deadline', 1))
    
    for job in jobs:
        job['_id'] = str(job['_id'])
        job['created_by'] = str(job['created_by'])
        job['deadline'] = job['deadline'].isoformat()
        job['created_at'] = job['created_at'].isoformat()
    
    return jsonify(jobs)

@app.route('/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job = db.jobs.find_one({'_id': ObjectId(job_id)})
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    job['_id'] = str(job['_id'])
    job['created_by'] = str(job['created_by'])
    job['deadline'] = job['deadline'].isoformat()
    job['created_at'] = job['created_at'].isoformat()
    
    return jsonify(job)

@app.route('/jobs', methods=['POST'])
@token_required # DECORATOR ADDED: Must check token first
@role_required('coordinator')
def create_job():
    user = request.current_user
    data = request.get_json()
    
    # ... (rest of the function logic is fine) ...
    deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
    
    job = {
        'title': data['title'],
        'company': data['company'],
        'type': data['type'],
        'location': data['location'],
        'ctc': data.get('ctc'),
        'stipend': data.get('stipend'),
        'tech_stack': data.get('tech_stack', []),
        'deadline': deadline,
        'eligibility': data.get('eligibility', {}),
        'description': data.get('description'),
        'created_by': user['_id'],
        'created_at': datetime.now(timezone.utc)
    }
    
    result = db.jobs.insert_one(job)
    job['_id'] = str(result.inserted_id)
    job['created_by'] = str(job['created_by'])
    job['deadline'] = job['deadline'].isoformat()
    job['created_at'] = job['created_at'].isoformat()
    
    return jsonify(job), 201

# --- APPLICATION ROUTES ---
# app.py

@app.route('/applications', methods=['POST'])
@token_required
def create_application():
    user = request.current_user
    data = request.get_json()
    job_id = ObjectId(data['job_id'])
    
    job = db.jobs.find_one({'_id': job_id})
    if not job:
        return jsonify({'error': 'Job not found', 'code': 'ERR_NOT_FOUND'}), 404
    
    # THE FIX IS HERE: We make the deadline from the DB "timezone-aware"
    deadline_from_db = job['deadline'].replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > deadline_from_db:
        return jsonify({'error': 'Application deadline has passed', 'code': 'ERR_DEADLINE'}), 400
    
    if not user.get('resume_url'):
        return jsonify({'error': 'Please add a resume URL to your profile', 'code': 'ERR_RESUME_REQUIRED'}), 400
    
    existing = db.applications.find_one({'user_id': user['_id'], 'job_id': job_id})
    if existing:
        return jsonify({'error': 'Already applied to this job', 'code': 'ERR_DUPLICATE'}), 409

    application = {
        'user_id': user['_id'],
        'job_id': job_id,
        'status': 'Applied',
        'created_at': datetime.now(timezone.utc),
        'notes': None,
        'profile_snapshot': { 'name': user['name'], 'email': user['email'] }
    }
    
    result = db.applications.insert_one(application)
    application['_id'] = str(result.inserted_id)
    application['user_id'] = str(application['user_id'])
    application['job_id'] = str(application['job_id'])
    application['created_at'] = application['created_at'].isoformat()
    
    return jsonify(application), 201
# app.py

# app.py

@app.route('/applications', methods=['GET'])
@token_required
def get_applications():
    user = request.current_user
    
    print(f"--- Fetching applications for user ID: {user['_id']} ---")
    
    applications = list(db.applications.find({'user_id': user['_id']}))
    
    print(f"--- Found {len(applications)} applications in the database ---")
    
    for app_doc in applications:
        # Convert all application fields first
        app_doc['_id'] = str(app_doc['_id'])
        app_doc['user_id'] = str(app_doc['user_id'])
        job_id = app_doc['job_id'] # Keep the ObjectId for the query
        app_doc['job_id'] = str(app_doc['job_id'])
        app_doc['created_at'] = app_doc['created_at'].isoformat()
        
        # Find the job using the ObjectId
        job = db.jobs.find_one({'_id': job_id}, {'title': 1, 'company': 1, 'deadline': 1})
        
        if job:
            # THE FIX IS HERE: Ensure all fields from the 'job' object are also converted
            job['_id'] = str(job['_id']) # Convert the job's _id
            job['deadline'] = job['deadline'].isoformat()
            app_doc['job'] = job
        else:
            app_doc['job'] = None
    
    return jsonify(applications)

@app.route('/jobs/<job_id>/applications', methods=['GET'])
@token_required # DECORATOR ADDED: Must check token first
@role_required('coordinator')
def get_job_applications(job_id):
    applications = list(db.applications.find({'job_id': ObjectId(job_id)}))
    
    for app_doc in applications:
        app_doc['_id'] = str(app_doc['_id'])
        app_doc['user_id'] = str(app_doc['user_id'])
        app_doc['job_id'] = str(app_doc['job_id'])
        app_doc['created_at'] = app_doc['created_at'].isoformat()
    
    return jsonify(applications)

@app.route('/applications/<app_id>/status', methods=['PUT'])
@token_required # DECORATOR ADDED: Must check token first
@role_required('coordinator')
def update_application_status(app_id):
    data = request.get_json()
    
    update_data = { 'status': data['status'] }
    if 'notes' in data:
        update_data['notes'] = data['notes']
    
    result = db.applications.update_one(
        {'_id': ObjectId(app_id)},
        {'$set': update_data}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'Application not found'}), 404
    
    return jsonify({'message': 'Application status updated successfully'})

# app.py

# --- NEW COORDINATOR-SPECIFIC JOB ROUTES ---

@app.route('/coord/jobs', methods=['GET'])
@token_required
@role_required('coordinator')
def get_coordinator_jobs():
    """Fetches only the jobs created by the currently logged-in coordinator."""
    user = request.current_user
    jobs = list(db.jobs.find({'created_by': user['_id']}))
    
    # Add application count to each job
    for job in jobs:
        job['_id'] = str(job['_id'])
        job['created_by'] = str(job['created_by'])
        job['deadline'] = job['deadline'].isoformat()
        job['created_at'] = job['created_at'].isoformat()
        app_count = db.applications.count_documents({'job_id': ObjectId(job['_id'])})
        job['application_count'] = app_count

    return jsonify(jobs)


@app.route('/jobs/<job_id>', methods=['PUT'])
@token_required
@role_required('coordinator')
def update_job(job_id):
    """Updates an existing job posting."""
    user = request.current_user
    job_oid = ObjectId(job_id)
    
    job = db.jobs.find_one({'_id': job_oid})
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    # Security Check: Ensure the coordinator owns this job
    if job['created_by'] != user['_id']:
        return jsonify({'error': 'Unauthorized to edit this job'}), 403

    data = request.get_json()
    update_data = {}
    
    # Add fields you want to be updatable
    allowed_fields = ['title', 'company', 'type', 'location', 'ctc', 'stipend', 'tech_stack', 'eligibility', 'description']
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
            
    if 'deadline' in data:
        update_data['deadline'] = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))

    db.jobs.update_one({'_id': job_oid}, {'$set': update_data})
    
    return jsonify({'message': 'Job updated successfully'})


@app.route('/jobs/<job_id>', methods=['DELETE'])
@token_required
@role_required('coordinator')
def delete_job(job_id):
    """Deletes a job posting and all its associated applications."""
    user = request.current_user
    job_oid = ObjectId(job_id)
    
    job = db.jobs.find_one({'_id': job_oid})
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    # Security Check: Ensure the coordinator owns this job
    if job['created_by'] != user['_id']:
        return jsonify({'error': 'Unauthorized to delete this job'}), 403
        
    # Delete the job and its applications
    db.jobs.delete_one({'_id': job_oid})
    db.applications.delete_many({'job_id': job_oid})
    
    return jsonify({'message': 'Job and all associated applications deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)