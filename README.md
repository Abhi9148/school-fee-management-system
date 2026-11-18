# 🏫 School Fee Management System

A full-stack web application built with **Next.js 16**, **TypeScript**, and **Prisma ORM** to streamline school fee administration. It provides a centralized dashboard for managing student records, tracking fee collections, monitoring pending dues, and maintaining structured financial oversight.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)

---

## ✨ Key Features

* **Admin Dashboard:** Centralized overview displaying key student metrics, total fees collected, and pending balances.
* **Student Management:** Add, view, update, and organize student profiles and enrollment details.
* **Fee Tracking & Records:** Manage fee structures, record transactions, and track paid vs. overdue statuses.
* **Protected Routes:** Custom Next.js middleware (`middleware.ts`) for secure route handling and access control.
* **Modern Responsive UI:** Clean sidebar navigation and responsive layout styled with Tailwind CSS v4.
* **Type-Safe Database Layer:** End-to-end type safety using TypeScript and Prisma Client.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (App Router) & React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **ORM & Database:** Prisma ORM (`@prisma/client`)
* **Linting:** ESLint 9 (`eslint-config-next`)

---

## 📂 Project Structure

```text
school-fee-management-system/
├── app/                # Next.js App Router pages, layouts, and API routes
├── components/         # Reusable UI components (sidebar, cards, tables, forms)
├── lib/                # Utility functions and Prisma client configuration
├── prisma/             # Database schema and migrations
├── public/             # Static assets and images
├── middleware.ts       # Route protection and request middleware
└── next.config.ts      # Next.js configuration
```

⚙️ Getting Started (Local Setup)
1. Clone the repository
git clone https://github.com/Abhi9148/school-fee-management-system.git
cd school-fee-management-system

2. Install dependencies
npm install

3. Configure environment variables
Create a .env file in the root directory and add your database connection string:

DATABASE_URL="your_database_connection_url_here"

4. Set up the database
Generate the Prisma client and push the schema to your database:

npx prisma generate
npx prisma db push

5. Run the development server
npm run dev

Open http://localhost:3000 in your browser to view the application.

👤 Author
Abhishek Subhash Kumbhar

GitHub: @Abhi9148

LinkedIn: Abhishek Kumbhar
