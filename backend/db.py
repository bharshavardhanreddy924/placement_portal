import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/placement_portal')

client = MongoClient(MONGO_URI)
db = client.placement_portal

users = db.users
jobs = db.jobs
applications = db.applications

users.create_index([("email", 1)], unique=True)
applications.create_index([("user_id", 1), ("job_id", 1)], unique=True)
jobs.create_index([("deadline", 1)])