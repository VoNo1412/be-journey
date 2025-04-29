
# HabitSocial - Habit Social Fullstack Project

**HabitSocial** is a fullstack web application that helps users track habits, set goals, and stay motivated on their personal development journeys. From learning new skills to improving fitness, it offers a free, structured roadmap based on the SMART goal-setting methodology. The platform also supports team collaboration through task creation and assignment.

HabitSocial empowers users with clear plans, real-time progress tracking, and a user-friendly dashboard, making it ideal for those who struggle with starting or staying consistent without expensive coaching.

👉 [Visit HabitSocial](#)

---

## ✨ Features

### 🔧 Core Features

#### 🗂️ Project Management
- Create projects (e.g., _"Learn English"_, _"90-Day Workout"_) with titles, descriptions, and timelines.
- Break projects into milestones for manageable progress.

#### ✅ Task Management
- Add actionable tasks with deadlines, priorities, and statuses (`Not Started`, `In Progress`, `Done`).
- Assign tasks to team members for collaborative projects.
- Support subtasks for complex tasks.

#### 🧭 Milestone Tracking
- Group tasks under milestones (e.g., _"Master Alphabet Pronunciation"_).
- Monitor milestone deadlines and completion.

#### 📊 Dashboard & Analytics
- View progress with completion percentages and milestone achievements.
- Track task completion rates via interactive charts.

#### 👥 Team Collaboration
- Assign tasks with role-based access (e.g., admins, project managers).
- Real-time updates for team tasks.

---

## 🛠️ Technical Features

- **Authentication**: Secure JWT-based login with role-based access control (RBAC).
- **API**: RESTful APIs built with NestJS, documented via Swagger.
- **Database**: Type-safe interactions using TypeORM and MySQL.
- **Infrastructure**: AWS (EC2, S3), Cloudflare R2, NGINX reverse proxy, PM2 for process management.
- **Containerization**: Docker for consistent environments.

---

## 🧱 Technologies Used

| Layer      | Stack                          |
|------------|---------------------------------|
| Frontend   | ReactJS, Redux                  |
| Backend    | NestJS, TypeORM                 |
| Database   | MySQL                           |
| Cloud      | AWS (EC2, S3), Cloudflare R2    |
| DevOps     | Docker, PM2, NGINX              |
| Docs       | Swagger                         |

---

## 🧩 Database Structure

The schema is designed to manage users, projects, tasks, milestones, and assignments efficiently.

### ER Diagram

You can visualize the model via **[dbdiagram.io](https://dbdiagram.io/)** using the following DBML script:

````dbml
// DBML code here (as previously provided)
Table User {
  id int [pk]
  username varchar(255) [unique]
  email varchar(255) [unique]
  password varchar(255)
  avatar text
  isOnline boolean [default: false]
  lastSeen timestamp
}

Table Project {
  id int [pk]
  name varchar(255)
  idea text
  tab enum('TEAM', 'INDIVIDUAL') [default: 'TEAM']
}

Table Roadmap {
  id int [pk]
  title varchar(255)
  description text
  comment text
  releaseDate date
  projectId int [ref: > Project.id]
}

Table Task {
  id int [pk]
  title text
  status enum('Pending', 'In Progress', 'Completed') [default: 'Pending']
  categoryId int [ref: > Category.id]
}

Table SubTask {
  id int [pk]
  title text
  description text
  summarize text
  status enum('Pending', 'In Progress', 'Completed') [default: 'Pending']
  taskId int [ref: > Task.id]
}

Table Category {
  id int [pk]
  name enum('Work', 'Personal', 'Study', 'Other')
  color text
}

Table TaskUser {
  id int [pk]
  isCompleted boolean [default: false]
  status enum('Pending', 'In Progress', 'Completed') [default: 'Pending']
  assignById int [ref: > User.id]
  userId int [ref: > User.id]
  taskId int [ref: > Task.id]
}

Table UserProject {
  id int [pk]
  userId int [ref: > User.id]
  projectId int [ref: > Project.id]
}
````
---

## 🧪 Getting Started

### Prerequisites
- Node.js (v14+)
- Docker
- MySQL
- AWS account (optional)

### Installation Steps

```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
npm install
```

Create a `.env` file:

```env
# Database config
DB_HOST=
DB_PORT=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

# Server config
PORT=

# JWT
JWT_EXPRIES=
JWT_SECRET=
NODE_ENV=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_CALLBACK=

# Frontend
FRONTEND_URL=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# Cloudflare R2
R2_S3_API=
R2_CUSTOM_DOMAIN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_S3_BUCKET=
```

Run database migrations:

```bash
npm run typeorm:migration:run
```

Start the backend:

```bash
npm run start:dev
```

(Optional) Run with Docker:

```bash
docker-compose up --build
```

---

## 🚀 Access Points

- Backend API: `http://localhost:3000/api`
- Swagger Docs: `http://localhost:3000/api/docs`

---

## 🔮 Future Improvements

- Push notifications for deadlines and milestones
- AI-driven habit suggestions
- Gamification (badges, streaks)
- Mobile app (iOS & Android)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📬 Contact

Have questions, suggestions, or feedback?  
Email us at [vuxuanhuy2k1@gmail.com](mailto:email@example.com) 
