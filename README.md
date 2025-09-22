# 🌐 Lumnus Portal

The **Lumnus Consulting Portal** is a full-stack web application with a **React + Vite** frontend and a **Node.js + Prisma + Supabase** backend. It powers internal workflows like applications, attendance, and dashboards for Lumnus Consulting.  

---

## ⚙️ Prerequisites
- **Node.js** (v18+ recommended) → https://nodejs.org/  
- **npm** (comes with Node) → https://www.npmjs.com/  
- **Prisma CLI** (optional, for database work) → https://www.prisma.io/docs/getting-started  

---

## 🚀 Getting Started

**1️⃣ Clone the repository**  
    git clone https://github.com/your-org/Lumnus-Portal.git  
    cd Lumnus-Portal  

**2️⃣ Frontend (React + Vite)**  
    cd client  
    npm install  
    npm run dev  
Runs at 👉 http://localhost:5173  

**3️⃣ Backend (Node + Prisma + Supabase)**  
    cd server  
    npm install  

Create a `.env` file in `server/`:  
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"  
    SUPABASE_URL="your-supabase-url"  
    SUPABASE_KEY="your-supabase-key"  

Run migrations & start server:  
    npx prisma migrate dev  
    npm start  
Runs at 👉 http://localhost:3000  

---

## 🛠 Development Notes
- Frontend reloads automatically with **Vite**  
- Backend requires restart (use `nodemon` for auto-reload)  
- Database changes: update `schema.prisma`, then run:  
    npx prisma migrate dev  
    npx prisma generate  

---

## 📦 Tech Stack
- **Frontend:** React, Vite  
- **Backend:** Node.js, Express  
- **Database:** Prisma + PostgreSQL (Supabase)  
- **File Uploads:** Multer  

---

## 🤝 Contributing
1. Fork the repo & create a branch  
2. Make changes and commit with clear messages  
3. Push and open a Pull Request  