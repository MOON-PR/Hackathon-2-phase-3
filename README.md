# NEONTASK

> **Cyberpunk Task Manager - Sync your workflow in the digital realm.**

NEONTASK is a next-generation, AI-powered task management system built with a futuristic cyberpunk aesthetic. It leverages **Next.js 14** for a high-performance frontend and **FastAPI** for a robust, scalable backend, all integrated with **Gemini 2.0** for intelligent task assistance.

## 🚀 Features

- **Cyberpunk Aesthetics:** Immersive neon UI with glitch effects and futuristic design.
- **AI-Powered:** Integrated with Google Gemini 2.0 for smart task suggestions and chat.
- **Real-time Sync:** Instant updates across devices.
- **PWA Support:** Installable on mobile and desktop.
- **Secure Auth:** JWT-based stateless authentication.
- **Full-Stack:** Next.js (Frontend) + FastAPI (Backend) + Neon Postgres (Database).

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, React Query
- **Backend:** Python FastAPI, SQLModel, PostgreSQL
- **AI:** Google Gemini 2.0 Flash
- **Database:** Neon Serverless Postgres
- **Deployment:** Vercel (Multi-build)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MOON-PR/Hackathon-2-phase-3.git
   cd neontask
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the root directory (see `.env.example`).

5. **Run Locally:**
   - Backend: `python -m uvicorn backend.index:app --reload`
   - Frontend: `cd frontend && npm run dev`

## 🚀 Deployment

Designed for seamless deployment on **Vercel**.

1. Push to GitHub.
2. Import project to Vercel.
3. Add environment variables.
4. Deploy!

---

*v4.0.0 - Hackathon Build*