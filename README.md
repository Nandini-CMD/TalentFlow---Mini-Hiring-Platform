# 🌟 TalentFlow - Mini Hiring Platform  

[![GitHub Repo](https://img.shields.io/badge/GitHub-TalentFlow-blue?logo=github)](https://github.com/Nandini-CMD/TalentFlow---Mini-Hiring-Platform/tree/main)  
[![Live Demo](https://img.shields.io/badge/Live_App-Vercel-success?logo=vercel)](https://assessment-ace-kit-6ai1.vercel.app/)  
![License](https://img.shields.io/badge/License-MIT-green)  
![Status](https://img.shields.io/badge/Status-Active-brightgreen)  

---

TalentFlow is a modern **mini hiring platform** designed to simplify recruitment. It allows HR teams and recruiters to **manage jobs, candidates, and assessments** in an intuitive and efficient way.  

🔗 **Live App:** [Deployed App Link](https://assessment-ace-kit-6ai1.vercel.app/)  
📂 **GitHub Repo:** [TalentFlow Repository](https://github.com/Nandini-CMD/TalentFlow---Mini-Hiring-Platform/tree/main)  
🌐 **Website:** [TalentFlow Website](https://assessment-ace-kit-6ai1.vercel.app/)  

---

## 🎨 UI Preview  

Here’s a quick look at the TalentFlow interface:  

<p align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard Screenshot" width="700"/>
</p>

<p align="center">
  <img src="screenshots/job-listing.png" alt="Job Listing Screenshot" width="700"/>
</p>

*(Add your own screenshots inside a `screenshots/` folder and update the file names above)*  

---

## 🚀 Features
- 📝 **Job Management** – Create, update, and publish job postings.  
- 👥 **Candidate Tracking** – View and manage applicant details.  
- 🧑‍💻 **Assessments** – Integrate skill assessments for better hiring decisions.  
- 📊 **Dashboard** – Get an overview of jobs, applicants, and progress.  
- 🎨 **Modern UI** – Built with React + Tailwind for a clean, responsive design.  

---

## ⚙️ Tech Stack
- **Frontend:** React + TypeScript  
- **Styling:** TailwindCSS + shadcn/ui  
- **Bundler:** Vite  
- **Linting:** ESLint with React Hooks & TypeScript rules  
- **Config & Setup:** Node.js + TS configs  

---

## 🏗️ Architecture
TalentFlow/
│── public/ # Static files
│── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Main pages (Jobs, Candidates, Dashboard, etc.)
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utility functions
│ ├── index.css # Tailwind styles
│ └── main.tsx # Entry point
│
│── index.html # Base HTML template
│── tailwind.config.ts # Tailwind setup
│── tsconfig.node.json # TypeScript configuration
│── eslint.config.js # ESLint setup


---

## 🛠️ Setup & Installation
1. **Clone the repo**
   ```bash
   git clone https://github.com/Nandini-CMD/TalentFlow---Mini-Hiring-Platform.git
   cd TalentFlow---Mini-Hiring-Platform


Install dependencies

npm install


Run the development server

npm run dev


Build for production

npm run build


Preview production build

npm run preview

🤔 Issues & Challenges

Handling scalable candidate data storage for future improvements.

Balancing minimal design vs. full HRM features.

Integration with third-party assessment tools.

💡 Technical Decisions

React + Vite for fast builds and modern dev experience.

TypeScript for better maintainability and type safety.

TailwindCSS + shadcn/ui for rapid, consistent UI development.

ESLint + strict TypeScript config to enforce clean code.

📌 Future Improvements

Role-based authentication (HR, Candidate, Admin).

Email notifications for job updates.

Advanced analytics dashboard.

Mobile-first optimization.
