# CYBERSECURITY AWARENESS PLATFORM

React (Vite) + Node/Express + MongoDB (Mongoose) + JWT auth.

## Run it
Requires Node 18+ and MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm run seed              # creates 26 pets + demo accounts
npm run dev               # API on http://localhost:5000

                          #file:///C:/Users/mandl/Downloads/GartnerPeerInsights%20%E2%80%93%20Cybersecurity%20Awareness%20Platform.html#/category/health  
# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # site on http://localhost:5173
```

Demo logins: `admin@pawhaven.com / Admin@123` (admin) and `demo@pawhaven.com / Demo@123` (adopter).

## REST API
| Area | Endpoints |
|---|---|
| Auth | POST /api/auth/register, POST /api/auth/login, GET/PUT /api/auth/me |
| CYBERSECURITY | GET /api/security?q&category&gender&size&ageGroup&status&sort, GET /api/pets/stats, GET /api/pets/:id, POST/PUT/DELETE (admin) |
| Adoptions | POST /api/adoptions, GET /api/adoptions/mine, GET /api/adoptions (admin), PUT /api/adoptions/:id/status (admin), DELETE /api/adoptions/:id |
| Reviews | GET/POST /api/reviews/pet/:petId, DELETE /api/reviews/:id |
| Users (admin) | GET /api/users, PUT /api/users/:id/role, DELETE /api/users/:id |
| Contact | POST /api/contact, GET/DELETE (admin) |

## Notes
The Cybersecurity Awareness Platform is a MERN stack-based web application designed to improve users' knowledge of online security. It provides cybersecurity learning materials, interactive quizzes, password safety tips, phishing awareness, and multi-factor authentication guidance. Users can compare technology platforms, view ratings and reviews, and track their learning progress. The application uses MongoDB for data storage, Express.js and Node.js for backend APIs, and React.js for an interactive, responsive user interface. It aims to promote safe online practices and protect users from cyber threats.

