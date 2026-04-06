# WellMate

A full-stack web application with **Express.js** backend and **React** (Vite) frontend.

---

## 📁 Project Structure

```
WellMate/
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── app.js            # Express app (middleware + routes)
│   │   ├── index.js          # Entry point (starts server)
│   │   ├── routes/           # Route definitions
│   │   ├── controllers/      # Route handlers / business logic
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Data models (DB schemas)
│   │   └── config/           # App configuration
│   ├── .env                  # Environment variables (not committed)
│   ├── .env.example          # Example env file
│   └── package.json
│
└── frontend/                 # React + Vite
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── assets/
    │   └── components/       # (add your components here)
    ├── public/
    └── package.json
```

---

## 🚀 Getting Started

### Backend

```bash
cd backend
npm install
npm run dev       # starts on http://localhost:5000
```

**Test the API:**
```
GET http://localhost:5000/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

---

## 🔧 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values.

---

## 📡 API Base URL

The frontend is pre-configured to communicate with the backend at `http://localhost:5000/api`.
