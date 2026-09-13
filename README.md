# Velozity Dashboard

## Project Overview

This project is a real-time project management dashboard designed to manage projects and tasks with role-based access. It provides secure JWT authentication for Admin, Project Manager, and Developer roles. Users can track tasks, update task status, view activity updates in real time, receive notifications, and monitor overdue tasks.

## Tech Stack

### 1. Frontend
- React
- TypeScript
- Vite
- CSS

### 2. Backend
- Node.js
- Express.js
- TypeScript

### 3. Database
- PostgreSQL
- Prisma ORM

### 4. Authentication
- JWT
- HTTP-only Cookies

### 5. Real-time Communication
- WebSocket

### 6. Background Jobs
- Node-Cron

## Features

- Role-based access control for Admin, Project Manager, and Developer
- JWT-based authentication with access and refresh tokens
- Secure refresh token handling using HTTP-only cookies
- Project and task management
- Task status and priority management
- Server-side authorization and validation
- Real-time activity feed using WebSocket
- Role-filtered activity visibility
- Task notifications
- Automated overdue task detection using a background job
- Dashboard filters for status, priority, and due-date range
- Responsive dashboard interface

## Project Structure

The project is divided into two main parts:

- `client/` - Contains the frontend of the application built with React and TypeScript.
- `server/` - Contains the backend API built with Node.js, Express, and TypeScript.
- `.gitignore` - Contains files and folders that should not be committed to Git.
- `README.md` - Contains project documentation and setup information. 

## Installation and Setup

### 1. Clone the repository

git clone `https://github.com/avinash565/velozity-dashboard`
cd velozity-dashboard

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

## Environment Variables

The backend requires environment variables for the PostgreSQL
connection and JWT authentication secrets.

Create a .env file inside the server directory and configure the
required database URL and JWT secrets.

Do not commit the .env file or expose secret values publicly.


## Database Setup

This project uses PostgreSQL as the relational database and Prisma ORM for database access.

### 1. Create the PostgreSQL Database

Create a PostgreSQL database named:  `velozity_dashboard`

### 2. Configure the Database URL

Add the PostgreSQL connection string to the backend `.env` file:

DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/velozity_dashboard"

Replace `USERNAME` and `PASSWORD` with your local PostgreSQL credentials.

### 3. Run Prisma Migrations

From the `server` directory, run:

```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client

Run:

```bash
npx prisma generate
```

### 5. Seed the Database

Run:

```bash
npm run seed
```

The seed script creates the initial users, clients, projects, tasks, and activity logs required for testing the application.

## Running the Application

### 1. Backend

From the `server` directory, start the development server:

```bash
npm run dev
```

### 2. Frontend

From the `client` directory, start the development server:

```bash
npm run dev
```

The frontend application runs on:
http://localhost:5173

### 3. Running Both Applications

Start the backend and frontend development servers in separate terminal windows.

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

## Authentication and Authorization

### 1. JWT Authentication

- Explain that users authenticate through email/password.
- After successful login, the backend issues a short-lived JWT access token.
- The access token is used to access protected API endpoints.

### 2. Refresh Token

- A refresh token is generated alongside the access token.
- The refresh token is stored in an HTTP-only cookie rather than localStorage.
- When the access token expires, the refresh endpoint can issue a new access token after validating the refresh token.

### 3. Role-Based Access Control

- `Admin:` Full access to application data and activity.
- `Project Manager:` Can create and manage projects they own and manage their related tasks.
- `Developer:` Can access and update only tasks assigned to them.

### 4. Server-Side Authorization

- Authorization is enforced at the API level.
- Protected routes authenticate the user before processing requests.
- Project ownership and task-assignment checks are performed on the server.
- Therefore, changing frontend UI or manually modifying an API request does not grant access to unauthorized project/task data.

### 5. Security
- Passwords are stored as hashes rather than plaintext.
- JWT secrets and database credentials are loaded through environment variables.
- API inputs are validated server-side.

## Real-Time Activity Feed

### 1. WebSocket Communication

- Application uses a native WebSocket connection for real-time communication between the frontend and backend.
- After establishing the connection, the client authenticates itself using the JWT access token.
- The server validates the token and associates the WebSocket connection with the authenticated user's role.

### 2. Live Activity Updates

When a task status is changed:
- The change is stored in PostgreSQL.
- An activity log is created with the user, task/project, previous status, new status, and timestamp.
- The backend broadcasts an activity event through WebSocket.
- Connected clients receive the event and update their activity feed without manually refreshing the page.

### 3. Role-Based Activity Filtering

- `Admin:` Can receive activity from all projects.
- `Project Manager:` Receives activity only from projects they manage.
- `Developer:` Receives activity only for tasks assigned to them.

  This filtering happens on both the server and the frontend.

### 4. Offline / Missed Activities

- Recent activity records are stored in PostgreSQL.
- When the dashboard loads, the backend fetches the latest 20 activities allowed for the authenticated user's role.
- Therefore, a user who was offline can still see recent activity after returning.

### 5. Why WebSocket?

WebSocket was selected because the activity feed requires immediate server-to-client updates. It avoids repeatedly polling the API and provides a persistent connection for real-time events.

## Background Jobs

- The application uses Node-Cron to run a scheduled background job for overdue tasks.
- The job runs at a fixed interval and checks the database for tasks whose due date has passed.
- Tasks that have passed their due date are marked as overdue in the database.
- When a task becomes overdue, an in-app notification is created for the assigned developer.
- Overdue detection is performed by the scheduled background job rather than during page loading.

### Why Node-Cron?

Node-Cron was chosen because the application requires a lightweight scheduled job for periodically checking and updating overdue tasks. It is simple to configure and suitable for this application's current background-processing requirements.


## Seed Data

The project includes a database seed script that creates a predefined set of users and project-related data for development, testing, and demonstration purposes.

### 1. Seeded Users

The seed script creates the following user roles:

| Role | Number of Users |
|------|-----------------|
| Admin | 1 |
| Project Manager | 2 |
| Developer | 4 |
| **Total** | **7** |

### 2. Demo Credentials

The following accounts are available for testing the different role-based access levels:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@velozity.com` | `Admin@123` |
| Project Manager 1 | `pm1@velozity.com` | `PM1@123` |
| Project Manager 2 | `pm2@velozity.com` | `PM2@123` |
| Developer 1 | `dev1@velozity.com` | `Dev1@123` |
| Developer 2 | `dev2@velozity.com` | `Dev2@123` |
| Developer 3 | `pm3@velozity.com` | `Dev3@123` |
| Developer 4 | `pm4@velozity.com` | `Dev4@123` |

### 3. Seeded Project Data

The seed script also creates:

- 3 clients
- 3 projects
- 15 tasks
- Tasks distributed across different statuses and priorities
- At least 2 overdue tasks
- Pre-existing activity log entries for testing the activity feed

### 4. Running the Seed Script

From the `server` directory, run:

```bash
npm run seed
```

## API Overview

### 1. Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate a user and issue tokens |
| POST | `/auth/refresh` | Refresh an expired access token |
| GET | `/auth/me` | Get the currently authenticated user |

### 2. Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects` | Create a project |
| GET | `/projects` | Get accessible projects |
| PUT | `/projects/:id` | Update a project |

### 3. Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/tasks` | Create a task |
| GET | `/tasks` | Get accessible tasks with optional filters |
| PATCH | `/tasks/:id/status` | Update task status |

### 4. Activities

| Method | Endpoint | Description |
|---|---|---|
| GET | `/activities` | Get the latest role-filtered activity records |

### 5. Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Get notifications for the authenticated user |

## Security

- `Server-side authorization:` Protected API routes verify the authenticated user and enforce role-based permissions on the backend.
- `Password hashing:` User passwords are stored as secure hashes rather than plaintext passwords.
- `JWT security:` Access and refresh tokens are signed using secrets stored in environment variables.
- `HTTP-only refresh cookie:` Refresh tokens are stored in an HTTP-only cookie to prevent direct access from client-side JavaScript.
- `Ownership checks:` Project Managers can only manage projects they own, while Developers can only access/update tasks assigned to them.
- `Server-side validation:` API inputs such as task status, priority, IDs, and required fields are validated before database operations.
- `Environment variables:` Database credentials and JWT secrets are kept in .env and excluded from version control.


## Future Improvements

- Better notification management
- More dashboard analytics
- Improved deployment architecture
- Additional testing

## Conclusion

- This project helped me build a full-stack project management dashboard with role-based access control, JWT authentication, task management, real-time activity updates, notifications, and automated overdue task handling.

- Working on the project gave me practical experience with React, TypeScript, Node.js, Express, PostgreSQL, Prisma, WebSockets, and background jobs.

- The most valuable part was implementing secure API-level authorization and role-filtered real-time activity updates.

- I would further improve the application by adding more automated tests, richer dashboard analytics, and additional notification features.
