from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
import db
from auth import role_required, before_request

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

app.before_request(before_request)

@app.route('/me', methods=['GET'])
def get_profile():
    user = request.current_user
    return jsonify(user)

@app.route('/me', methods=['PUT'])
def update_profile():
    user = request.current_user
    data = request.get_json()
    
    allowed_fields = ['name', 'phone', 'gender', 'dob', 'branch', 'ug_percentage', 
                     'ug_cgpa', 'ug_yop', 'tenth_percentage', 'tenth_yop',
                     'twelfth_percentage', 'twelfth_yop', 'diploma_percentage',
                     'diploma_yop', 'has_internship', 'standing_backlogs',
                     'resume_url', 'skills', 'links']
    
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    db.users.update_one({'_id': user['_id']}, {'$set': update_data})
    
    updated_user = db.users.find_one({'_id': user['_id']})
    updated_user['_id'] = str(updated_user['_id'])
    return jsonify(updated_user)

@app.route('/me/experience', methods=['POST'])
def add_experience():
    user = request.current_user
    data = request.get_json()
    
    experience = {
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
    
    return jsonify({'message': 'Experience added successfully'})

@app.route('/me/experience/<int:exp_index>', methods=['PUT'])
def update_experience(exp_index):
    user = request.current_user
    data = request.get_json()
    
    update_fields = {}
    for field in ['type', 'company', 'title', 'location', 'start_date', 'end_date', 
                  'is_current', 'summary', 'technologies', 'achievements', 'links', 'proof']:
        if field in data:
            update_fields[f'experience.{exp_index}.{field}'] = data[field]
    
    db.users.update_one({'_id': user['_id']}, {'$set': update_fields})
    
    return jsonify({'message': 'Experience updated successfully'})

@app.route('/me/experience/<int:exp_index>', methods=['DELETE'])
def delete_experience(exp_index):
    user = request.current_user
    
    current_user = db.users.find_one({'_id': user['_id']})
    experiences = current_user.get('experience', [])
    
    if exp_index < len(experiences):
        experiences.pop(exp_index)
        db.users.update_one({'_id': user['_id']}, {'$set': {'experience': experiences}})
    
    return jsonify({'message': 'Experience deleted successfully'})

@app.route('/jobs', methods=['GET'])
def get_jobs():
    query = {}
    
    search_query = request.args.get('q', '')
    if search_query:
        query['$or'] = [
            {'title': {'$regex': search_query, '$options': 'i'}},
            {'company': {'$regex': search_query, '$options': 'i'}},
            {'tech_stack': {'$in': [{'$regex': search_query, '$options': 'i'}]}}
        ]
    
    tech = request.args.get('tech', '')
    if tech:
        query['tech_stack'] = {'$in': [tech]}
    
    location = request.args.get('location', '')
    if location:
        query['location'] = {'$regex': location, '$options': 'i'}
    
    before_deadline = request.args.get('before_deadline', 'true')
    if before_deadline.lower() == 'true':
        query['deadline'] = {'$gte': datetime.now(timezone.utc)}
    
    sort_by = request.args.get('sort', 'deadline')
    sort_order = 1 if sort_by == 'deadline' else -1
    
    jobs = list(db.jobs.find(query).sort(sort_by, sort_order))
    
    for job in jobs:
        job['_id'] = str(job['_id'])
        job['created_by'] = str(job['created_by'])
        if isinstance(job['deadline'], datetime):
            job['deadline'] = job['deadline'].isoformat()
        if isinstance(job['created_at'], datetime):
            job['created_at'] = job['created_at'].isoformat()
    
    return jsonify(jobs)

@app.route('/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    from bson import ObjectId
    
    job = db.jobs.find_one({'_id': ObjectId(job_id)})
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    job['_id'] = str(job['_id'])
    job['created_by'] = str(job['created_by'])
    if isinstance(job['deadline'], datetime):
        job['deadline'] = job['deadline'].isoformat()
    if isinstance(job['created_at'], datetime):
        job['created_at'] = job['created_at'].isoformat()
    
    return jsonify(job)

@app.route('/jobs', methods=['POST'])
@role_required('coordinator')
def create_job():
    user = request.current_user
    data = request.get_json()
    
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

@app.route('/applications', methods=['POST'])
def create_application():
    from bson import ObjectId
    
    user = request.current_user
    data = request.get_json()
    job_id = ObjectId(data['job_id'])
    
    job = db.jobs.find_one({'_id': job_id})
    if not job:
        return jsonify({'error': 'Job not found', 'code': 'ERR_NOT_FOUND'}), 404
    
    if datetime.now(timezone.utc) > job['deadline']:
        return jsonify({'error': 'Application deadline has passed', 'code': 'ERR_DEADLINE'}), 400
    
    if not user.get('resume_url'):
        return jsonify({'error': 'Resume URL is required', 'code': 'ERR_RESUME_REQUIRED'}), 400
    
    eligibility = job.get('eligibility', {})
    
    if eligibility.get('min_cgpa') and user.get('ug_cgpa', 0) < eligibility['min_cgpa']:
        return jsonify({'error': 'Does not meet minimum CGPA requirement', 'code': 'ERR_INELIGIBLE'}), 400
    
    if eligibility.get('min_percentage') and user.get('ug_percentage', 0) < eligibility['min_percentage']:
        return jsonify({'error': 'Does not meet minimum percentage requirement', 'code': 'ERR_INELIGIBLE'}), 400
    
    if eligibility.get('branches') and user.get('branch') not in eligibility['branches']:
        return jsonify({'error': 'Branch not eligible for this position', 'code': 'ERR_INELIGIBLE'}), 400
    
    existing = db.applications.find_one({'user_id': user['_id'], 'job_id': job_id})
    if existing:
        return jsonify({'error': 'Already applied to this job', 'code': 'ERR_DUPLICATE'}), 409
    
    experience = user.get('experience', [])
    top_experience = experience[0] if experience else None
    
    profile_snapshot = {
        'name': user['name'],
        'email': user['email'],
        'phone': user.get('phone'),
        'branch': user.get('branch'),
        'ug_percentage': user.get('ug_percentage'),
        'ug_cgpa': user.get('ug_cgpa'),
        'skills': user.get('skills', []),
        'resume_url': user.get('resume_url'),
        'links': user.get('links', {}),
        'top_experience': top_experience
    }
    
    application = {
        'user_id': user['_id'],
        'job_id': job_id,
        'status': 'Applied',
        'created_at': datetime.now(timezone.utc),
        'notes': None,
        'profile_snapshot': profile_snapshot
    }
    
    result = db.applications.insert_one(application)
    application['_id'] = str(result.inserted_id)
    application['user_id'] = str(application['user_id'])
    application['job_id'] = str(application['job_id'])
    application['created_at'] = application['created_at'].isoformat()
    
    return jsonify(application), 201

@app.route('/applications', methods=['GET'])
def get_applications():
    user_id = request.args.get('user_id')
    
    if user_id == 'me':
        user_id = request.current_user['_id']
    
    applications = list(db.applications.find({'user_id': user_id}))
    
    for app in applications:
        app['_id'] = str(app['_id'])
        app['user_id'] = str(app['user_id'])
        app['job_id'] = str(app['job_id'])
        app['created_at'] = app['created_at'].isoformat()
        
        job = db.jobs.find_one({'_id': app['job_id']})
        if job:
            app['job'] = {
                'title': job['title'],
                'company': job['company'],
                'deadline': job['deadline'].isoformat()
            }
    
    return jsonify(applications)

@app.route('/jobs/<job_id>/applications', methods=['GET'])
@role_required('coordinator')
def get_job_applications(job_id):
    from bson import ObjectId
    
    applications = list(db.applications.find({'job_id': ObjectId(job_id)}))
    
    for app in applications:
        app['_id'] = str(app['_id'])
        app['user_id'] = str(app['user_id'])
        app['job_id'] = str(app['job_id'])
        app['created_at'] = app['created_at'].isoformat()
    
    return jsonify(applications)

@app.route('/applications/<app_id>/status', methods=['PUT'])
@role_required('coordinator')
def update_application_status(app_id):
    from bson import ObjectId
    
    data = request.get_json()
    
    update_data = {
        'status': data['status']
    }
    
    if 'notes' in data:
        update_data['notes'] = data['notes']
    
    db.applications.update_one(
        {'_id': ObjectId(app_id)},
        {'$set': update_data}
    )
    
    return jsonify({'message': 'Application status updated successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)