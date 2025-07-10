# Jobify - Job Search Platform for High School Students

A comprehensive full-stack job search platform specifically designed to help high school students find and apply for suitable employment opportunities. This project was developed for the **FBLA 2024-25 Website Coding and Development** competition.

## 🚀 Project Overview

Jobify addresses the unique challenges high school students face when searching for their first jobs. The platform features AI-powered job grading, gamification elements, and a modern React frontend with a Django REST API backend. Our intelligent scoring system evaluates job suitability specifically for high school students, considering factors like education requirements, work hours compatibility with school schedules, and age restrictions.

## 🎯 FBLA Competition Context

This project was created for the **FBLA 2024-25 Website Coding and Development** event, focusing on:
- A page for employers to submit postings
- A backend panel to approve or delete postings
- A page displaying the approved postings
- A page for students to apply for the posting
## 🌟 Features

### Core Features
- **User Authentication & Profiles**: Complete user registration, login, and profile management with [`UserProfile`](backend/myapp/models.py) model
- **Job Posting & Search**: Employers can post jobs using the [`JobPosting`](backend/myapp/models.py) model, students can search and filter opportunities
- **Smart Job Grading**: AI-powered system using Cerebras LLaMA that grades job suitability for high school students (1-100 scale) via [`job_grade.py`](backend/myapp/job_grade.py)
- **Application Management**: Track job applications and their status through the user profile system
- **Messaging System**: Direct communication between employers and job seekers using the [`Message`](backend/myapp/models.py) model
- **File Management**: Upload and manage resumes and profile pictures

### Advanced Features
- **Gamification System**: Points, levels, badges, and challenges to encourage engagement using [`Badge`](backend/myapp/models.py), [`Challenge`](backend/myapp/models.py), and [`UserChallenge`](backend/myapp/models.py) models
- **Geographic Integration**: Travel time calculation and location-based job scoring (additional 25 points)
- **Admin Panel**: Job approval system with pending/approved/denied status workflow
- **Real-time Grading**: Live job grading as employers create postings via the [`grade_job_lv`](backend/myapp/job_grade.py) function
- **Favorites System**: Save and manage favorite job postings
- **Reference & Education Management**: Comprehensive profile building with [`Reference`](backend/myapp/models.py) and [`Education`](backend/myapp/models.py) models

### AI Job Grading
- **Intelligent Job Scoring**: Uses Cerebras LLaMA-4-Scout model to evaluate job suitability on a 1-75
-  **Travel Time Calculator**:Uses GEO APIFY to calculate travel time. This time is then converted to a 1-25 score
-  **Grade Combination**: SCores are then combined to give the full job grade out of 100

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Material-UI (MUI)** for modern UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Framer Motion** for animations
- **TailwindCSS** for styling
- **Axios** for API communication
- **Lucide React** for icons
- **React Confetti** for celebrations
- **Recharts** for data visualization

### Backend
- **Django 4.2** with Django REST Framework
- **SQLite** database (development)
- **Cerebras Cloud SDK** for AI integration
- **Django CORS Headers** for cross-origin requests
- **Pillow** for image processing
- **Python-dotenv** for environment variable management

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **pip** (Python package manager)
- **Git**

## 🚀 Installation & Setup

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install django djangorestframework django-cors-headers pillow python-dotenv cerebras-cloud-sdk openai
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   API_KEY=your_cerebras_api_key_here
   EMAIL_HOST_U=your_email_host
   EMAIL_PASS_U=your_email_password
   ```

4. **Create a superuser (admin):**
   ```bash
   python manage.py createsuperuser
   ```
   - This will be used to access an Admin account
   - Existing admin acount, User:`bobtt` Password:`123456`

5. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://127.0.0.1:8000/`

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## 👤 Admin Access

**Admin Credentials:**
- **Username:** `bobtt`
- **Password:** `123456`

**Admin Panel Access:**
- Navigate to `http://127.0.0.1:8000/admin/` for Django admin
- Navigate to `http://localhost:3000/admin/` for custom admin features

## 📁 Project Structure

```
state_jobify/
├── backend/
│   ├── appbackend/              # Django project settings
│   │   ├── settings.py          # Main configuration file
│   │   ├── urls.py              # Root URL configuration
│   │   └── wsgi.py              # WSGI configuration
│   ├── myapp/                   # Main application
│   │   ├── models.py            # Database models (UserProfile, JobPosting, etc.)
│   │   ├── views.py             # API endpoints and business logic
│   │   ├── urls.py              # URL routing
│   │   ├── job_grade.py         # AI job grading system with Cerebras integration
│   │   ├── geo_apify.py         # Geographic utilities for travel time calculation
│   │   └── admin.py             # Django admin configuration
│   ├── static/                  # Static files (CSS, JS, images)
│   ├── media/                   # User uploads (resumes, profile pictures)
│   ├── templates/               # HTML templates
│   └── manage.py                # Django management script
├── frontend/
│   ├── src/                     # React source code
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── store/               # Redux store configuration
│   │   ├── utils/               # Utility functions
│   │   └── App.jsx              # Main application component
│   ├── package.json             # Node.js dependencies and scripts
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # TailwindCSS configuration
│   └── index.html               # Entry HTML file
└── README.md                    # Project documentation
```

## 💻 Code Architecture & Technical Details

### Database Models
The application uses Django ORM with several key models:

- **[`UserProfile`](backend/myapp/models.py)**: Extended user model with gamification fields, job provider status, and profile completion tracking
- **[`JobPosting`](backend/myapp/models.py)**: Comprehensive job model with status workflow (pending/approved/denied) and AI grading integration
- **[`Message`](backend/myapp/models.py)**: Real-time messaging system between users
- **[`Badge`](backend/myapp/models.py)** & **[`Challenge`](backend/myapp/models.py)**: Gamification system for user engagement
- **[`Reference`](backend/myapp/models.py)** & **[`Education`](backend/myapp/models.py)**: Profile enhancement models

### AI Integration
The [`job_grade.py`](backend/myapp/job_grade.py) module implements:
- **Cerebras LLaMA-4-Scout Integration**: Uses advanced language model for job suitability assessment
- **Dual Scoring System**: Base job score (1-75) + location score by GEO APIFY (up to 25 points)
- **Error Handling**: Robust fallback mechanisms for API failures
- **Real-time Grading**: Live scoring as users input job descriptions

### Frontend Architecture
- **React 18** with modern hooks and context
- **Redux Toolkit** for centralized state management
- **Material-UI** components with custom theming
- **Responsive Design** using TailwindCSS
- **Route Protection** with authentication guards

## 🎮 Gamification System

The platform includes a comprehensive gamification system to encourage student engagement:

- **Points**: Earned through profile completion, job applications, and challenges
- **Levels**: Progressive leveling system based on accumulated points
- **Badges**: Achievement system for various milestones (First Application, Profile Complete, etc.)
- **Challenges**: Time-limited objectives with specific criteria
- **Leaderboards**: Optional competitive rankings (opt-in via `opt_in_leaderboard` field)


## 🔧 Development Scripts

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Commands
```bash
python manage.py runserver           # Start development server
python manage.py makemigrations      # Create database migrations
python manage.py migrate             # Apply migrations
python manage.py collectstatic       # Collect static files
python manage.py createsuperuser     # Create admin user
```

## 🎯 Usage Guide

### For Job Seekers (Students)
1. **Register** a new account with student profile
2. **Complete your profile** including education, references, and resume upload
3. **Browse jobs** with intelligent filtering and AI-powered recommendations
4. **Apply to positions** and track application status
5. **Earn gamification rewards** through platform engagement
6. **Communicate directly** with employers via built-in messaging

### For Employers
1. **Register** as a job provider
2. **Post job listings** with real-time AI grading feedback
3. **Review applications** from qualified high school students
4. **Manage postings** through approval workflow
5.  **Find applicants** on the find applicants page (http://localhost:3000/find-applicants)
6. **Message candidates** directly through the platform

### For Administrators
1. **Access admin panel** with provided credentials
2. **Moderate job postings** (approve/deny workflow)
3. **Manage user accounts** and resolve platform issues
4. **Monitor engagement** through gamification analytics

## 🔒 Security Features

- **JWT Token Authentication** for secure API access
- **CORS Protection** with configurable allowed hosts
- **File Upload Validation** for resume and image uploads
- **SQL Injection Protection** via Django ORM
- **XSS Prevention** through React's built-in protections
- **CSRF Protection** for form submissions

## 🌟 Unique Features & Innovation

1. **AI-Powered Job Suitability**: First platform to use advanced AI for high school job evaluation
2. **Geographic Intelligence**: Travel time integration for realistic job accessibility
3. **Gamified Experience**: Points, badges, and challenges make job searching engaging
4. **Real-time Feedback**: Live job grading during posting creation
5. **Student-Centric Design**: Built specifically for high school student needs and constraints
6. **Comprehensive Communication**: Built-in messaging eliminates external communication needs

## 🎓 Educational Value

This project demonstrates:
- **Full-Stack Development**: Complete frontend and backend integration
- **AI Integration**: Practical application of modern language models
- **Database Design**: Complex relational database with Django ORM
- **API Development**: RESTful API design and implementation
- **Modern Frontend**: React with contemporary libraries and patterns
- **User Experience**: Intuitive design focused on target demographic

## 📊 Performance & Scalability

- **Optimized Database Queries**: Efficient ORM usage with proper indexing
- **Caching Strategy**: Static file serving and media optimization
- **Error Handling**: Comprehensive error management throughout the application
- **Responsive Design**: Mobile-first approach for accessibility
- **Modular Architecture**: Scalable code organization for future expansion

## 🎥 Demo Videos

# Student View Video

https://github.com/user-attachments/assets/2e2650ae-051f-431c-8768-95f2729ec51a

# Recruiter and Admin View Video

https://github.com/user-attachments/assets/9d816668-15ca-4721-86a2-c263e8daf3ae






---

**Developed for FBLA 2024-25 Website Coding and Development Competition**

*This platform represents the future of high school job searching, combining artificial intelligence, modern web technologies, and user-centered design to create meaningful employment opportunities for students.*
