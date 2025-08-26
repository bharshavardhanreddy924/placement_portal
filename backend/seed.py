from datetime import datetime, timezone, timedelta
import db
from bson import ObjectId

def seed_database():
    db.users.delete_many({})
    db.jobs.delete_many({})
    db.applications.delete_many({})
    
    student_user = {
        'role': 'student',
        'name': {'first': 'Raj', 'last': 'Kumar'},
        'email': 'student@demo.in',
        'phone': '9876543210',
        'gender': 'Male',
        'dob': '2002-05-15',
        'degree': 'BE',
        'branch': 'CSE',
        'college': 'RVCE',
        'ug_percentage': 82.5,
        'ug_cgpa': 8.2,
        'ug_yop': 2026,
        'tenth_percentage': 85.0,
        'tenth_yop': 2020,
        'twelfth_percentage': 88.0,
        'twelfth_yop': 2022,
        'has_internship': True,
        'standing_backlogs': False,
        'resume_url': 'https://example.com/resume.pdf',
        'skills': ['Python', 'React', 'MongoDB', 'Flask'],
        'links': {
            'github': 'https://github.com/rajkumar',
            'linkedin': 'https://linkedin.com/in/rajkumar'
        },
        'experience': [
            {
                'type': 'Internship',
                'company': 'Tech Corp',
                'title': 'Software Intern',
                'location': 'Bangalore',
                'start_date': '2024-06-01',
                'end_date': '2024-08-31',
                'is_current': False,
                'summary': 'Developed web applications using React and Python',
                'technologies': ['React', 'Python', 'MongoDB'],
                'achievements': ['Built 3 full-stack applications', 'Improved performance by 20%'],
                'links': ['https://github.com/project1']
            }
        ],
        'updated_at': datetime.now(timezone.utc)
    }
    
    coordinator_user = {
        'role': 'coordinator',
        'name': {'first': 'Dr. Priya', 'last': 'Sharma'},
        'email': 'coord@demo.in',
        'phone': '9876543211',
        'updated_at': datetime.now(timezone.utc)
    }
    
    student_id = db.users.insert_one(student_user).inserted_id
    coord_id = db.users.insert_one(coordinator_user).inserted_id
    
    now = datetime.now(timezone.utc)
    
    jobs_data = [
        {
            'title': 'Software Engineer Intern',
            'company': 'Google',
            'type': 'Internship',
            'location': 'Bangalore',
            'stipend': 50000,
            'tech_stack': ['Python', 'React', 'MongoDB'],
            'deadline': now + timedelta(hours=12),
            'eligibility': {
                'min_cgpa': 7.5,
                'min_percentage': 75,
                'branches': ['CSE', 'AIML', 'CSE CY', 'CSE DS'],
                'backlogs_allowed': False
            },
            'description': 'Join our team as a Software Engineer Intern and work on cutting-edge projects.',
            'created_by': coord_id,
            'created_at': now
        },
        {
            'title': 'Full Stack Developer',
            'company': 'Microsoft',
            'type': 'Full-time',
            'location': 'Hyderabad',
            'ctc': 1200000,
            'tech_stack': ['React', 'Node.js', 'Azure'],
            'deadline': now + timedelta(days=7),
            'eligibility': {
                'min_cgpa': 8.0,
                'branches': ['CSE', 'AIML', 'CSE DS'],
                'backlogs_allowed': False
            },
            'description': 'Work on enterprise-grade applications with global impact.',
            'created_by': coord_id,
            'created_at': now
        },
        {
            'title': 'Data Science Intern',
            'company': 'Amazon',
            'type': 'Internship',
            'location': 'Bangalore',
            'stipend': 45000,
            'tech_stack': ['Python', 'Machine Learning', 'AWS'],
            'deadline': now + timedelta(days=5),
            'eligibility': {
                'min_percentage': 80,
                'branches': ['CSE', 'AIML', 'CSE DS'],
                'backlogs_allowed': False
            },
            'description': 'Work with big data and machine learning algorithms.',
            'created_by': coord_id,
            'created_at': now
        },
        {
            'title': 'Frontend Developer',
            'company': 'Flipkart',
            'type': 'Full-time',
            'location': 'Bangalore',
            'ctc': 1000000,
            'tech_stack': ['React', 'JavaScript', 'CSS'],
            'deadline': now + timedelta(days=10),
            'eligibility': {
                'min_cgpa': 7.0,
                'branches': ['CSE', 'AIML', 'ISE'],
                'backlogs_allowed': True
            },
            'description': 'Build user interfaces for millions of users.',
            'created_by': coord_id,
            'created_at': now
        },
        {
            'title': 'Backend Engineer',
            'company': 'Zomato',
            'type': 'Full-time',
            'location': 'Delhi',
            'ctc': 900000,
            'tech_stack': ['Java', 'Spring Boot', 'MySQL'],
            'deadline': now + timedelta(days=15),
            'eligibility': {
                'min_percentage': 70,
                'branches': ['CSE', 'ISE', 'EIE'],
                'backlogs_allowed': True
            },
            'description': 'Scale backend systems for food delivery platform.',
            'created_by': coord_id,
            'created_at': now
        },
        {
            'title': 'DevOps Engineer',
            'company': 'Paytm',
            'type': 'Full-time',
            'location': 'Noida',
            'ctc': 1100000,
            'tech_stack': ['Docker', 'Kubernetes', 'AWS'],
            'deadline': now + timedelta(days=20),
            'eligibility': {
                'min_cgpa': 7.5,
                'branches': ['CSE', 'AIML', 'EIE'],
                'backlogs_allowed': False
            },
            'description': 'Manage cloud infrastructure and deployment pipelines.',
            'created_by': coord_id,
            'created_at': now
        }
    ]
    
    job_ids = []
    for job_data in jobs_data:
        job_id = db.jobs.insert_one(job_data).inserted_id
        job_ids.append(job_id)
    
    print(f"Seeded database with:")
    print(f"- 2 users (student: student@demo.in, coordinator: coord@demo.in)")
    print(f"- {len(jobs_data)} jobs")
    print("Demo setup complete!")

if __name__ == '__main__':
    seed_database()