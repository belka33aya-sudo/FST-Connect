# FST-Connect

FST-Connect is a comprehensive full-stack pedagogical management platform designed to streamline operations within the Faculté des Sciences et Techniques (FST). It bridges the gap between administration, teachers, and students by providing role-based portals configured to handle academic, administrative, and logistical data securely.

## ✨ Features

- **Multi-Role Dashboards**: Targeted, data-rich dashboards for Administrators, Teachers, and Students with relevant high-level metrics and interactive charts.
- **Academic Management**: Robust tools for administrators to manage Fields of study (Filières), Groups (TD/TP), Modules, and Scheduling (Emplois du temps).
- **Pedagogical Follow-up**: Intuitive interfaces for teachers to input and manage grades (Notes) and track student attendance (Absences) with real-time validation and synchronization.
- **Project & Internship Tracking**: Monitors Final Year Projects (PFE) and internships (Stages), including deadlines, thesis/report submissions, and jury assignments.
- **Communications**: Integrated notification system for priority alerts and a global announcement portal.
- **Authentication & Security**: Role-based access control protected by JWT and hashed passwords.

## 💻 Tech Stack

### Frontend
- **React 18** (Bootstrapped with Vite)
- **React Router v6** for seamless single-page orientation
- **Chart.js / React-Chartjs-2** for visualizing academic metrics
- **Lucide React** for crisp, modern icons

### Backend
- **Node.js** & **Express**
- **Prisma ORM** for type-safe database access
- **PostgreSQL** relational database
- **JWT (JSON Web Tokens)** & **Bcryptjs** for authorization
- **Cors** & **Dotenv** configuration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database instance running locally or remotely

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd FST-Connect
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

### Configuration & Database Setup

1. In the `backend` directory, create a `.env` file and define your database URL:
   ```env
   DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/<DB_NAME>?schema=public"
   ```

2. Initialize the database schema and seed the initial data:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   # If available, run your seed script:
   npm run seed
   ```

### Running the Application

To run the application, you'll need to start both the frontend and backend development servers.

**Start the Backend server:**
```bash
cd backend
npm run dev
# The backend typically listens on port 5000 or 8080.
```

**Start the Frontend server:**
```bash
# In a new terminal window at the root of the project:
npm run dev
# The frontend will be available at http://localhost:5173
```

## 🏗️ Architecture

FST-Connect is built to handle strict relational integrity and transactional data flows. It operates on a robust PostgreSQL database mapping out a complex university hierarchy (over 30 models from Study Fields and Modules to Student Grades, Announcements, and Notifications). The frontend seamlessly syncs context-based data with the backend API to guarantee real-time updates and an engaging user experience without data loss or conflicts.
