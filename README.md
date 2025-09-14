# TalentFlow - Mini Hiring Platform  

TalentFlow is a modern **mini hiring platform** designed to streamline the recruitment process for small to medium organizations. It provides features for **job posting, candidate management, and assessments** in a lightweight, scalable web application.  

---

## 🚀 Features  

- **Job Management** – Create, edit, and manage job postings.  
- **Candidate Tracking** – Store and view candidate details, resumes, and application status.  
- **Assessments** – Conduct simple online skill tests.  
- **Responsive UI** – Built with React + TailwindCSS for a clean, modern interface.  
- **Scalable Setup** – TypeScript + modular architecture for maintainability.  

---

## 📂 Dataset / Storage  

- Candidate and job data can be integrated with an API (future enhancement).  
- Currently uses local mock data / JSON (depending on your setup).  

---

## 🛠️ Tech Stack  

- **Frontend**: React, TypeScript  
- **Styling**: TailwindCSS, PostCSS, Autoprefixer  
- **Build Tool**: Vite  
- **Config**: `tsconfig.json`, `postcss.config.js`, `tailwind.config.ts`  

---

## 📊 File Structure  

```bash
TalentFlow/
│── index.html                # Entry point
│── tsconfig.json             # TypeScript config
│── tsconfig.app.json         # App-specific TypeScript config
│── tailwind.config.ts        # TailwindCSS configuration
│── postcss.config.js         # PostCSS configuration
│── src/
│   ├── main.tsx              # App entry (React DOM render)
│   ├── App.tsx               # Root component
│   ├── components/           # Reusable UI components
│   ├── pages/                # Pages (Jobs, Candidates, Assessments)
│   └── assets/               # Static files
⚙️ Setup and Installation
Prerequisites
Node.js (v16+)

npm or yarn

Clone the Repository
bash
Copy code
git clone https://github.com/yourusername/TalentFlow.git
cd TalentFlow
Install Dependencies
bash
Copy code
npm install
# or
yarn install
Run the Development Server
bash
Copy code
npm run dev
The app will be available at: http://localhost:5173 (default Vite port).

🔗 Usage
Navigate to the Jobs Page → create/manage job postings.

Open Candidates Page → track applicants.

Use Assessments Page → conduct simple hiring assessments.

🌱 Future Enhancements
 API integration with backend (Node.js + Express + DB)

 Authentication for recruiters and candidates

 Resume parsing using AI/ML

 Analytics dashboard for hiring insights

🤝 Contributing
Fork the repo

Create your feature branch (git checkout -b feature-name)

Commit your changes (git commit -m 'Add feature')

Push to the branch (git push origin feature-name)

Open a Pull Request
