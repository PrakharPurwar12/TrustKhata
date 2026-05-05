<div align="center">
  <img src="https://img.icons8.com/color/120/000000/ledger.png" alt="TrustKhata Logo" />
  <h1>TrustKhata</h1>
  <p><strong>A Modern, Secure, and Professional Ledger & Khata Application</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  </p>
</div>

<br />

**TrustKhata** is a full-stack digital ledger application designed to replace traditional paper-based khata systems. Built with a focus on simplicity, speed, and premium user experience, it empowers small businesses and merchants to track their credits (udhaar) and payments securely.

## ✨ Key Features

- 🌓 **Global Dark Mode**: Persistent and professional dark theme spanning the entire application.
- 📱 **Mobile Optimized**: Fluid UI with Floating Action Buttons (FABs), native-like modals, and touch-friendly targets.
- ⚡ **SaaS-Grade UX**: Features shimmer skeleton loaders, smooth animations (Framer Motion), and toast notifications.
- 📊 **Advanced Sorting & Filters**: Track your top debtors, sort alphabetically, or filter credit/payment history instantly.
- 📅 **Backdated Entries**: Built-in date picker to log previous transactions efficiently.
- 🔒 **Secure Architecture**: JWT-based authentication, shop-level data isolation, and robust backend validation.

## 🚀 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Lucide React Icons, Framer Motion
- **Backend:** Python, Django, Django REST Framework, SQLite (Development)

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Git

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/PrakharPurwar12/TrustKhata.git
cd TrustKhata/backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the server
python manage.py runserver
```
*The backend API will run at `http://127.0.0.1:8000/`*

### 2. Frontend Setup

Open a new terminal window:

```bash
cd TrustKhata/frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The web app will run at `http://localhost:5173/`*

---

<div align="center">
  <p>Built with ❤️ for digital merchants</p>
</div>
