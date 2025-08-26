# Placement Portal

A full-stack web application to streamline and modernize campus placement activities, built with React (frontend) and Flask (backend). The portal supports students, placement coordinators, and now includes an AI-powered Resume Coach to help students improve their job readiness.

---

## Table of Contents

- [Overview](#overview)
- [Why This Project?](#why-this-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Demo Accounts](#demo-accounts)

---

## Overview

This Placement Portal is designed to digitize and simplify the campus recruitment process. It allows students to register, update their profiles, and apply for jobs, while placement coordinators can post jobs, manage applications, and oversee the entire placement workflow. The portal also features an AI-powered Resume Coach to provide personalized feedback and learning plans for students based on their resumes.

---

## Why This Project?

Campus placements are a critical phase for students and institutions, but the process is often manual, fragmented, and inefficient. This project addresses these challenges by:

- **Centralizing** all placement activities in one platform.
- **Automating** job postings, applications, and candidate management.
- **Empowering students** with tools to improve their employability, such as the AI Resume Coach.
- **Providing transparency** and analytics for coordinators and students.
- **Reducing paperwork** and communication gaps between students and placement cells.

---

## Features

### Core Features

- **User Authentication:** Secure JWT-based login and registration.
- **Role-Based Access:** Separate dashboards and permissions for Students and Coordinators.
- **Student Profile Management:** Students can update academic, personal, and skill details.
- **Job Postings & Search:** Coordinators can post jobs; students can browse and search listings.
- **Application Management:** Students can apply for jobs; coordinators can view and manage applicants.
- **Coordinator Dashboard:** Overview of jobs, applications, and student data.
- **Responsive UI:** Modern, mobile-friendly interface using React and Tailwind CSS.

### AI Resume Coach (NEW)

- **Resume Analysis:** Upload a PDF resume to receive an AI-generated analysis.
- **Personalized Feedback:** Get a one-sentence profile, core strengths, skill gaps (foundations, frameworks, tools, data/AI, soft skills), and a 30-day improvement plan.
- **Learning Path:** Actionable learning resources and project ideas tailored to your target role or job description.
- **Role Fit Assessment:** See which roles best match your profile and why.
- **Interactive Chat:** Ask the AI for further advice, resources, or interview prep plans.
- **India-Friendly:** Recommendations focus on common tech stacks and free/affordable resources relevant to Indian students.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Flask, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS, PyMongo
- **Database:** MongoDB
- **AI Integration:** Groq API (Llama-3 model) for resume analysis and chat

---

## Folder Structure

```
├── backend/         # Flask API backend
│   ├── app.py       # Main Flask app
│   ├── auth.py      # Auth decorators
│   ├── db.py        # MongoDB connection
│   ├── resume_ai.py # AI Resume Coach backend
│   └── seed.py      # Demo data seeder
├── frontend/        # React frontend
│   ├── src/
│   │   ├── api/         # Axios API config
│   │   ├── components/  # React components
│   │   ├── context/     # Auth context
│   │   └── pages/       # App pages (including ResumeCoach.jsx)
│   ├── public/
│   └── ...
├── package-lock.json
└── README.md
```

---

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
     GROQ_API_KEY=your-groq-api-key  # Required for Resume Coach
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

---

## Environment Variables

- **Backend:** See `.env` example above. The `GROQ_API_KEY` is required for the Resume Coach feature.
- **Frontend:** No special environment variables required for local development (API URL is set to `http://localhost:5000`).

---

## Usage

- Open the frontend in your browser: [http://localhost:5173](http://localhost:5173)
- Register as a student or login as a coordinator (see demo accounts below).
- Students can update their profile, apply for jobs, and use the Resume Coach.
- Coordinators can post jobs and manage applications.

---

## Demo Accounts

- **Student:**
  - Email: `student@demo.in`
  - Password: `student123`
- **Coordinator:**
  - Email: `coord@demo.in`
  - Password: `coord123`

---

