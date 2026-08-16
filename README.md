# Otto Demo App — Task Tracker

A simple full-stack task tracker app with a React frontend and Node.js/Express backend.

## Structure

```
otto-demo-app/
├── frontend/       # React + Vite frontend
├── backend/        # Express.js REST API
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
npm install
npm start
```
Runs on http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List all tasks |
| POST | /api/tasks | Create a task |
| PUT | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

## Deploy

This project includes a GitHub Actions workflow (./.github/workflows/deploy.yml) that builds and deploys both frontend and backend on push to main.
