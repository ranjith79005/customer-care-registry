# 🎫 Customer Care Registry

> A full-stack customer complaint management system — log, assign, and resolve customer issues with role-based access control.

**Stack:** Node.js · Express · MongoDB (Mongoose) · JWT Auth · React (Vite) · React Router

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://customer-registry-lilac.vercel.app)
[![API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://customer-registry-sn17.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-hem187%2Fcustomer--registry-181717?style=for-the-badge&logo=github)](https://github.com/hem187/customer-registry)

### 🔑 Demo Login Credentials
| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@ccr.test` | `password123` |
| 🧑‍💼 Agent | `agent@ccr.test` | `password123` |
| Register as customer | — | — |

---

## ✨ Features

| Feature | Details |
|---|---|
| **Auth** | JWT-based register/login, 7-day tokens |
| **Roles** | `customer` · `agent` · `admin` |
| **Complaints** | Create, view, assign, update status, leave feedback |
| **Messaging** | Per-complaint chat thread (polling every 4 s) |
| **Access control** | Every route guards by role + ownership |

---

## 🗂 Project Structure

```
customer-care-registry/
├── server/                   # Express API (Node.js)
│   ├── index.js              # Entry point
│   ├── config/
│   │   └── db.js             # mongoose.connect()
│   ├── models/               # User · Complaint · Message (Mongoose schemas)
│   ├── middleware/           # auth.js (JWT verify) · roles.js (role guard)
│   ├── controllers/          # Business logic
│   ├── routes/               # Express routers
│   ├── scripts/
│   │   └── seed.js           # Creates demo admin + agent accounts
│   └── .env.example
└── client/                   # React (Vite) frontend
    ├── src/
    │   ├── pages/            # Home · Login · Register · RaiseComplaint
    │   │                     # MyComplaints · ComplaintDetail
    │   │                     # AgentDashboard · AdminDashboard
    │   ├── components/       # Navbar · ProtectedRoute · ComplaintCard · ChatBox
    │   ├── context/          # AuthContext.jsx
    │   └── api/              # axios.js (base URL config)
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** — choose one:
  - Local: install [MongoDB Community](https://www.mongodb.com/try/download/community) and run `mongod`
  - Cloud: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)

---

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Local MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/customer-care-registry

# MongoDB Atlas example
# MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/customer-care-registry

JWT_SECRET=replace_with_a_long_random_string
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

The API runs at **http://localhost:5000**. Verify with:

```bash
curl http://localhost:5000/api/health
# → {"status":"ok"}
```

**Optional — seed demo accounts** (public sign-up only creates customers):

```bash
node scripts/seed.js
```

| Email | Password | Role |
|---|---|---|
| `admin@ccr.test` | `password123` | admin |
| `agent@ccr.test` | `password123` | agent |
| `priya@ccr.test` | `password123` | agent |
| `rahul@ccr.test` | `password123` | agent |
| `emily@ccr.test` | `password123` | agent |

---

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env
# Defaults already point to http://localhost:5000/api
npm run dev
```

The app runs at **http://localhost:5173**.

---

## 🧪 Try It Out

1. Open `http://localhost:5173` → **Create an account** (registers as a customer)
2. Log in as the customer → **Raise a complaint**
3. In another browser/incognito → log in as `admin@ccr.test` → **Admin Dashboard** → assign complaint to an agent
4. Log in as `agent@ccr.test` → **Agent Dashboard** → open complaint, chat, update status
5. Back as the customer → once `resolved` or `closed`, leave a **rating + comment**

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/auth/register` | — | Register (customer) |
| `POST` | `/api/auth/login` | — | Login |
| `GET` | `/api/auth/me` | ✅ | Current user |
| `POST` | `/api/complaints` | customer | Create complaint |
| `GET` | `/api/complaints/mine` | customer | My complaints |
| `GET` | `/api/complaints/agent` | agent | Assigned complaints |
| `GET` | `/api/complaints` | admin | All complaints |
| `GET` | `/api/complaints/:id` | owner/agent/admin | Single complaint |
| `PATCH` | `/api/complaints/:id/assign` | admin | Assign to agent |
| `PATCH` | `/api/complaints/:id/status` | agent/admin | Update status |
| `PATCH` | `/api/complaints/:id/feedback` | customer | Leave feedback |
| `GET` | `/api/messages/:complaintId` | owner/agent/admin | Get messages |
| `POST` | `/api/messages/:complaintId` | owner/agent/admin | Send message |
| `GET` | `/api/users/agents` | admin | List agents |
| `POST` | `/api/users/staff` | admin | Create agent/admin |

---

## 🏗 How It's Built

- **Auth** — JWT signed on register/login, sent as `Authorization: Bearer <token>`, verified by `middleware/auth.js`.
- **Data model** — `User` (role: customer/agent/admin), `Complaint` (status, priority, assignedAgent, feedback), `Message` (belongs to a complaint).
- **Chat** — Simple polling (every 4 s) rather than WebSockets, keeping the project dependency-light. Swap in `socket.io` for real-time if needed.
- **Access control** — Every complaint/message route verifies the requester is the owner, assigned agent, or admin.

---

## 📄 License

MIT
