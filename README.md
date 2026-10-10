# PawHaven - MERN Pet Adoption Platform

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
| Pets | GET /api/pets?q&category&gender&size&ageGroup&status&sort, GET /api/pets/stats, GET /api/pets/:id, POST/PUT/DELETE (admin) |
| Adoptions | POST /api/adoptions, GET /api/adoptions/mine, GET /api/adoptions (admin), PUT /api/adoptions/:id/status (admin), DELETE /api/adoptions/:id |
| Reviews | GET/POST /api/reviews/pet/:petId, DELETE /api/reviews/:id |
| Users (admin) | GET /api/users, PUT /api/users/:id/role, DELETE /api/users/:id |
| Contact | POST /api/contact, GET/DELETE (admin) |

## Notes
- Double-booking is prevented by an atomic `findOneAndUpdate({status:'Available'} -> 'Reserved')`; only one simultaneous request can win.
- Pet photos in the seed data use loremflickr.com keyword images (internet needed). Replace the `image` field with your own URLs in the admin dashboard for exact photos. A friendly emoji placeholder shows if an image fails.
- Health tab separates "Verified medical record" (shelter vet) from "General care advice".
- Set `VITE_API_URL` in the client if the API is hosted on another domain.
