# AI Job Analyzer

A full-stack AI-powered job application analyzer that uses **two AI agents** to give you honest, actionable feedback on your resume.

##  Critic vs Coach — Two AI Agents

Unlike other resume analyzers, this app uses a **multi-agent architecture**:

- **The Critic** 🔴 — Acts as a harsh recruiter looking for reasons to reject you
- **The Coach** 🟢 — Acts as a supportive career advisor helping you shine

##  Features

- 📄 **PDF Resume Upload** — Upload your resume directly as a PDF
- 📊 **Match Score** — See how well your resume matches the job description
- 🤖 **AI Bot Score** — Detect how robotic your resume sounds to recruiters
- ❌ **Missing Skills Detection** — Know exactly what skills you're lacking
- ✅ **Profile Strengths** — Discover what makes you stand out
- ⚡ **Micro Skill Bridge** — Get specific 2-hour projects to bridge skill gaps
- 🎯 **Recommended Job Titles** — Find roles that match your current profile
- ✏️ **Fix-it Live Editor** — Edit your resume and re-analyze in real time
- 📄 **Export PDF Report** — Download your full analysis as a PDF

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express.js
- Multer (PDF upload)
- pdf-parse (PDF text extraction)

**AI:**
- Groq API (Llama 3.3 70B)
- Multi-Agent Architecture
- Structured JSON responses

**Deployment:**
- Frontend: Vercel
- Backend: Render

## Live Demo

🔗 [https://ai-job-analyzer-d5l1.vercel.app](https://ai-job-analyzer-d5l1.vercel.app)

##  How It Works

1. Upload your PDF resume or paste it as text
2. Paste the job description you're applying for
3. Click **Analyze My Application**
4. Get instant feedback from two AI agents
5. Edit your resume in the Fix-it Editor
6. Re-analyze and watch your score improve
7. Export your analysis as a PDF report

## 🏗️ Project Structure
ai-job-analyzer/
├── client/          # React frontend
│   ├── src/
│   │   └── App.js
│   └── package.json
├── routes/
│   └── analyze.js   # AI agent routes
├── server.js        # Express server
└── package.json