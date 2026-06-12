# Online Complain Registeration and Complaint Management System
B.Tech MERN major project for online complaint registration, assignment, tracking, resolution, and officer rating.
## Structure
client/                 React + Tailwind frontend
server/
  src/
    controller/         MVC controllers
    model/              Mongoose models
    routes/             Express routes
    server.js           Express app + MongoDB connection
## Tech Stack
- React
- Tailwind CSS
- Axios
- React Router
- Node.js
- Express.js
- MongoDB / Mongoose
- JWT Authentication
## Features
- Separate user, agent/officer, and admin login pages
- JWT authentication
- Random server-validated CAPTCHA on registration and login
- Password hashing
- Role-based authorization
- Complaint creation with image evidence upload
- Duplicate complaint prevention by title, category, and location
- User complaint history
- Admin complaint assignment
- Agent status updates
- Comments on complaints
- Resolution image upload
- User rating for officer after resolution
- Admin user and complaint management APIs
## Local Setup
Install dependencies:
powershell-
npm run install:all

Start MongoDB:
powershell-
mongod --dbpath "C:\Users\Computer\OneDrive\Documents\Online complaint\data\db"

Seed categories, the portal announcement, and an optional initial administrator configured in `server/.env`:

powershell-
npm run seed --prefix server

## Run The Project
Open the project in VS Code. The workspace terminal is configured to use Command Prompt.
Terminal 1:

mongod --dbpath "C:\Users\Computer\OneDrive\Documents\Online complaint\data\db"


Terminal 2:

npm run dev

The single `npm run dev` command starts both the React frontend and Express backend. It also detects already-running instances, so repeating the command does not cause a port conflict.

Open:
[http://localhost:5173](http://localhost:5173)
## Login Pages
- User: [http://localhost:5173/login/user](http://localhost:5173/login/user)
- Agent: [http://localhost:5173/login/agent](http://localhost:5173/login/agent)
- Admin: [http://localhost:5173/login/admin](http://localhost:5173/login/admin)

No fixed demo credentials are included. Configure `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` in `server/.env`, run the seed command, then create officers through the admin dashboard.
## GitHub Push
powershell-
git status
git add .
git commit -m "Build realistic complaint management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
