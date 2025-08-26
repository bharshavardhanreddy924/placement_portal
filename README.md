# Placement Portal

A full-stack web application for managing campus placement activities, built with React (frontend) and Flask (backend).

## Overview
This project is a Placement Portal designed to streamline the campus recruitment process. It allows students to register, update their profiles, and apply for jobs, while coordinators can post jobs, manage applications, and oversee the placement process.

## Features
- User authentication (JWT-based)
- Role-based access (Student, Coordinator)
- Student profile management
- Job postings and search
- Application management
- Coordinator dashboard
- Responsive UI with React and Tailwind CSS

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Flask, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS, PyMongo
- **Database:** MongoDB

## Folder Structure
```
├── backend/         # Flask API backend
│   ├── app.py       # Main Flask app
│   ├── auth.py      # Auth decorators
│   ├── db.py        # MongoDB connection
│   └── seed.py      # Demo data seeder
├── frontend/        # React frontend
│   ├── src/
│   │   ├── api/     # Axios API config
│   │   ├── components/ # React components
│   │   ├── context/ # Auth context
│   │   └── pages/   # App pages
│   ├── public/
│   └── ...
├── package-lock.json
└── README.md
```

## Setup Instructions

### Backend
1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Set up environment variables:**
   - Create a `.env` file in `backend/` with:
     ```env
     MONGO_URI=mongodb://localhost:27017/placement_portal
     JWT_SECRET_KEY=your-secret-key
     ```
3. **Run the backend server:**
   ```bash
   python app.py
   ```
   The backend runs on `http://localhost:5000` by default.

4. *(Optional)* **Seed demo data:**
   ```bash
   python seed.py
   ```

### Frontend
1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Run the frontend dev server:**
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173` by default.

## Environment Variables
- **Backend:** See `.env` example above.
- **Frontend:** No special environment variables required for local development (API URL is set to `http://localhost:5000`).

## Usage
- Open the frontend in your browser: [http://localhost:5173](http://localhost:5173)
- Register as a student or login as a coordinator (see demo accounts below).
- Students can update their profile and apply for jobs.
- Coordinators can post jobs and manage applications.

## Demo Accounts
- **Student:**
  - Email: `student@demo.in`
  - Password: `student123`
- **Coordinator:**
  - Email: `coord@demo.in`
  - Password: `coord123`

## License
This project is for educational/demo purposes.

