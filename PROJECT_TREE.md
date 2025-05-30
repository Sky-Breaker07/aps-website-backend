# APS Website Backend Project Structure

## Overview
This project is a backend application for the APS (Association of Physiotherapy Students) website. It's built with Express.js and MongoDB, following the MVC (Model-View-Controller) architecture pattern. The application provides various API endpoints for student authentication, profile management, academic resources, and other features specific to the physiotherapy student community.

## Project Structure

```
aps-website-backend/
├── app.js                 # Main application entry point
├── db/
│   └── connect.js         # MongoDB connection setup
├── middleware/
│   ├── authentication.js  # JWT authentication middleware
│   ├── error-handler.js   # Global error handling middleware
│   └── not-found.js       # 404 handler middleware
├── models/                # Mongoose data models
│   ├── Alumnus.js         # Alumni data model
│   ├── Birthday.js        # Birthday data model
│   ├── Gallery.js         # Gallery/media data model
│   ├── Payment.js         # Payment data model
│   ├── ProjectTopic.js    # Project topics data model
│   ├── Question.js        # Questions data model
│   ├── Role.js            # User roles data model
│   └── Student.js         # Student data model (main user model)
├── controllers/           # Route handlers/business logic
│   ├── alumnus.js         # Alumni-related controllers
│   ├── auth.js            # Authentication controllers
│   ├── birthdays.js       # Birthday-related controllers
│   ├── bulkquestions.js   # Bulk questions upload controllers
│   ├── election.js        # Election-related controllers
│   ├── essayqs.js         # Essay questions controllers
│   ├── fitg.js            # Fill-in-the-gap questions controllers
│   ├── gallery.js         # Gallery/media controllers
│   ├── leaders.js         # Student leaders controllers
│   ├── mcqs.js            # Multiple choice questions controllers
│   ├── payments.js        # Payment controllers
│   ├── profile.js         # Student profile controllers
│   ├── projectTopics.js   # Project topics controllers
│   ├── questions.js       # General questions controllers
│   ├── updatestudentproperties.js # Student profile update controllers
│   ├── uploadedquestions.js # Question upload controllers
│   └── uptime.js          # Server uptime controller
├── routes/                # API route definitions
│   ├── alumnus.js         # Alumni routes
│   ├── auth.js            # Authentication routes
│   ├── birthdays.js       # Birthday routes
│   ├── bulkquestions.js   # Bulk questions routes
│   ├── election.js        # Election routes
│   ├── essayqs.js         # Essay questions routes
│   ├── fitg.js            # Fill-in-the-gap questions routes
│   ├── gallery.js         # Gallery routes
│   ├── leaders.js         # Student leaders routes
│   ├── mcqs.js            # Multiple choice questions routes
│   ├── payments.js        # Payment routes
│   ├── profile.js         # Student profile routes
│   ├── projectTopics.js   # Project topics routes
│   ├── questions.js       # General questions routes
│   ├── updatestudentproperties.js # Student profile update routes
│   └── uptime.js          # Server uptime routes
├── views/                 # EJS templates for server-side rendering
│   ├── birthday.ejs       # Birthday display template
│   └── error.ejs          # Error page template
├── public/                # Static assets (CSS, JS, images)
├── errors/                # Custom error classes
├── docs/                  # Documentation files
└── package.json           # Project dependencies and scripts
```

## Core Components and Their Interactions

### 1. Application Entry Point
- **app.js**: The main entry point that initializes the Express application, sets up middleware, connects to the database, and registers all routes.

### 2. Database Connection
- **db/connect.js**: Establishes a connection to MongoDB using Mongoose.

### 3. Authentication Flow
- **routes/auth.js**: Defines authentication endpoints (login, register, password reset)
- **controllers/auth.js**: Implements authentication logic
- **middleware/authentication.js**: Verifies JWT tokens for protected routes
- **models/Student.js**: Defines the student schema with password hashing and JWT methods

### 4. API Request Flow
1. Client makes a request to an API endpoint (e.g., `/api/v1/profile`)
2. Request passes through middleware (authentication, etc.)
3. Router (`routes/profile.js`) directs to the appropriate controller method
4. Controller (`controllers/profile.js`) processes the request, interacts with models
5. Model (`models/Student.js`) performs database operations
6. Controller sends response back to client

### 5. Server-Side Rendering
- The application uses EJS templates for server-side rendering specific pages:
  - Birthday pages (`/birthday/:famn` route in app.js renders `views/birthday.ejs`)
  - Error pages (rendered by error handlers)

### 6. Question Management System
Multiple question types are supported through separate models, routes, and controllers:
- Multiple Choice Questions (MCQs)
- Fill-in-the-Gap Questions (FITG)
- Essay Questions
- Bulk Questions Upload

### 7. Student Management
- Authentication and registration
- Profile management
- Academic resources access
- Birthday tracking
- Leadership roles tracking

### 8. Project Topics Management
- Adding, updating, and retrieving project topics
- Assigning topics to students

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet for security headers
- XSS protection
- CORS configuration
- Input sanitization

## Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT implementation
- **express-rate-limit**: Rate limiting
- **helmet**: Security headers
- **cors**: Cross-Origin Resource Sharing
- **ejs**: Templating engine
- **dotenv**: Environment variables 