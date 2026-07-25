# ExpenseTracker Expert - Frontend

A modern, responsive personal finance management application built using React, TypeScript, Tailwind CSS, TanStack Router, React Query, and Zustand.

## Overview

ExpenseTracker Pro helps users manage their personal finances by tracking income, expenses, budgets, savings goals, and financial insights through a clean and intuitive dashboard.

---

## Features

### Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Logout Functionality
- Profile Management

### Dashboard

- Total Income
- Total Expenses
- Remaining Balance
- Savings Rate
- Monthly Budget Usage
- Recent Transactions
- Expense Distribution
- Income vs Expense Analytics

### Income Management

- Add Income
- Edit Income
- Delete Income
- Search Income
- Filter by Date

### Expense Management

- Add Expense
- Edit Expense
- Delete Expense
- Category-wise Tracking
- Search Expenses
- Filter Expenses

### Budget Management

- Monthly Budget Creation
- Budget Tracking
- Budget Utilization Percentage
- Remaining Budget Calculation
- Budget Alerts

### Goals Management

- Savings Goals
- Goal Progress Tracking
- Goal Completion Monitoring

### Notifications

- Budget Warning Alerts
- Budget Exceeded Alerts
- Transaction Notifications

### Analytics

- Income vs Expense Charts
- Expense Distribution Charts
- Monthly Financial Summary

### Profile & Settings

- User Profile
- Theme Switching
- Notification Preferences
- Date Format Settings

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS

### State Management

- Zustand

### Routing

- TanStack Router

### Data Fetching

- TanStack React Query
- Axios

### UI Components

- ShadCN UI
- Lucide Icons
- Framer Motion

### Charts

- Recharts

### Notifications

- Sonner Toasts

---

## Project Structure

```text
src
│
├── components
│   ├── ui
│   ├── charts
│   ├── forms
│   └── layout
│
├── routes
│   ├── login
│   ├── register
│   ├── dashboard
│   ├── transactions
│   ├── budgets
│   ├── analytics
│   ├── goals
│   └── profile
│
├── hooks
│
├── lib
│   ├── api
│   ├── store
│   └── utils
│
├── styles
│
└── types
```

---

## Screens

### Authentication

- Login Page
- Register Page

### Main Application

- Dashboard
- Transactions
- Budget Planner
- Categories
- Analytics
- Calendar
- Goals
- Notifications
- Profile
- Settings

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Ameenajabeen/expense_tracker_frontend.git
cd expense_tracker_frontend
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

For production:

```env
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

---

## Run Application

### Development Mode

```bash
npm run dev
```

Application runs on:

```text
http://localhost:8081
```

---

## Build for Production

```bash
npm run build
```

Output folder:

```text
dist/
```

Preview build:

```bash
npm run preview
```

## Author
**Harish V**
**Ameena Jabeen M**

B.E CSE(CYBER SECURITY) , B.Tech Information Technology   
R.M.K College of Engineering and Technology , R.M.D Engineering College

### GitHub

https://github.com/Harish0230

---

## License

This project is developed for educational, learning, and portfolio purposes.

---
