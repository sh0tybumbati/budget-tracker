# Budget Tracker

A modern, feature-rich budget tracking application built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Supabase** (or Node.js/Express + PostgreSQL). Supports static hosting on **GitHub Pages** with multi-user authentication and cloud sync.

---

## 🌟 Key Features

- 🔐 **Multi-User Authentication**: Individual user accounts with isolated budget workspaces via Supabase Auth.
- ☁️ **Cloud Database Sync**: Automatic real-time persistence with Supabase PostgreSQL and Row Level Security (RLS).
- 📊 **Real-time Budget Tracking**: Income and expense entry management with running totals preview.
- 🏷️ **Categorized Entries**: Color-coded category tags with custom adjustments.
- 📅 **Multiple Period Views**: Current period, Timeline, and Calendar views.
- 🔍 **Search & Filtering**: Quick searching and sorting across entries.
- 🌓 **Dark / Light Mode**: Dynamic themes.
- 💾 **Offline Fallback**: Automatic `localStorage` backup when offline or unauthenticated.
- 🚀 **GitHub Pages Ready**: Deploys automatically via GitHub Actions.

---

## 🚀 GitHub Pages & Supabase Setup

### Step 1: Create Supabase Project
1. Create a free account at [Supabase](https://supabase.com/).
2. Create a new project and copy your **Project URL** and **Anon API Key** from **Project Settings -> API**.

### Step 2: Set Up Database Schema & Security Rules
1. Open your Supabase project dashboard and go to **SQL Editor**.
2. Run the script provided in [`supabase_setup.sql`](file:///home/ad/Projects/budget-tracker/supabase_setup.sql):
   ```sql
   -- Creates budget_data table linked to auth.users and enables Row Level Security (RLS)
   ```

### Step 3: Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings -> Secrets and variables -> Actions**.
3. Add two repository secrets:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Go to **Settings -> Pages** and set the source build to **GitHub Actions**.
5. Push to the `main` branch to trigger the automated deployment workflow ([.github/workflows/deploy.yml](file:///home/ad/Projects/budget-tracker/.github/workflows/deploy.yml)).

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Option A: Start Vite development server
npm run dev

# Option B: Run local Express server (port 3001)
npm start
```

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend / Database**: Supabase JS SDK, PostgreSQL, Row Level Security
- **CI/CD**: GitHub Actions, GitHub Pages
- **Alternative Backend**: Express, PostgreSQL / SQLite, Docker

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).