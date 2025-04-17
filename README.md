# [Link website: http://3.0.139.123/](https://habitsocial.io.vn/)
# Habit Tracker – Fullstack Project

A fullstack Habit Tracker web application that allows users to track and manage their habits. The application also includes task creation and assignment functionality for teams.
HabitSocial aims to become a smart personal development companion that helps users set clear goals, track their progress, and stay motivated on long-term journeys — whether it's learning English, improving fitness, or building habits.
The platform bridges the gap for people who often feel lost at the starting point, lack structured plans, or can’t afford expensive coaching services, by offering a free, guided, and measurable roadmap built on the SMART goal-setting methodology.

Through detailed milestone tracking, real-time status updates, and flexible planning tools, HabitSocial empowers individuals to follow their journey with clarity, accountability, and persistence.



## Technologies Used

- **Frontend:** ReactJS, Redux
- **Backend:** NestJS, TypeORM
- **Database:** MySQL (via TypeORM)
- **Containerization:** Docker
- **Cloud Hosting:** AWS EC2
- **Process Management:** PM2
- **API Documentation:** Swagger
- **Reverse Proxy:** NGINX

## Features

- **Task Management:** 
  - Users can create tasks, set deadlines, assign priorities, and assign tasks to other users.
  - Admin or project managers can assign tasks to specific users.
  - Users can track their assigned tasks, mark them as in progress, and complete 
  
- **API Integration:**
  - RESTful API endpoints are created with NestJS, ensuring efficient task and habit management.
  - TypeORM is used to interact with the database in a type-safe manner, allowing seamless data management.
  
- **Authentication & Authorization:**
  - Users can securely log in using JWT-based authentication.
  - Role-based access control (RBAC) ensures only authorized users (e.g., admins or project managers) can assign tasks.

- **Process Management:**
  - PM2 ensures the NestJS server remains up with high availability, automatic restarts, and smooth deployment on AWS EC2.

- **API Documentation:**
  - Integrated Swagger for automatic API documentation, providing a clear interface for developers with detailed API endpoints, request/response schemas, and authentication methods.

- **Reverse Proxy:**
  - Configured NGINX as a reverse proxy to efficiently route traffic, enhance security, and improve performance for both the backend and frontend.

## Getting Started

### Prerequisites

Before running the project locally, ensure you have the following installed:

- Node.js (v14.x or higher)
- Docker (for containerization)
- MySQL (for database)
- AWS account (for EC2 and deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
