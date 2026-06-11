# Premium Full-Stack E-Commerce Platform

A production-ready, highly responsive E-Commerce platform built with **Next.js**, **React.js**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Node.js**, **Express.js**, and **MongoDB**.

---

## ⚡ Key Features

1. **Stunning Responsive UI/UX**: Premium dark/light themes, sleek animations via Framer Motion, micro-interactions, custom scrollbars, and glassmorphism.
2. **Advanced Catalog Navigation**: Searching, category checkmarks, manual price range filters, sorting options, and paginated grids.
3. **Dynamic Flash Sale Banner**: Countdowns and coupon codes (`MEGA20`, `WELCOME10`).
4. **Interactive Details & Galleries**: Thumbnail view switchers, magnifier hover zooms, attribute tables, and reviews creation forms.
5. **Secure Authentication & Account Settings**: Secure JWT tokens via Authorization headers, registration/login screens, dashboard profiles, wishlist selectors, and address managers.
6. **Order Placement & Timelines**: Inventory checks, stock updates, billing receipt generators, and delivery timelines (Pending, Processing, Shipped, Delivered).
7. **Full-Featured Admin Console**: Revenue metric cards, area sales trends charts, category sales pie charts, low-stock warning trackers, product listing CRUD modals, category appenders, order dispatch status triggers, and user promoter.
8. **Dynamic Database Fallback**: If MongoDB is offline or omitted, the backend automatically logs a warning and loads a **local JSON database client** (`backend/data/db.json`) that persists edits instantly, ensuring a zero-config setup for local evaluation.

---

## 🔑 Test Profiles & Accounts

The database contains pre-seeded accounts:

* **Admin Role**: `admin@ecommerce.com` / `Password123`
* **Customer Role**: `customer@ecommerce.com` / `Password123`
* **Promo Codes**: `WELCOME10` (10% Off above ₹1,000) | `MEGA20` (20% Off above ₹3,000)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### 1. Set Up the Backend
```bash
cd backend
# Install dependencies
npm install
# Seed products, categories, coupons, reviews, and test users
npm run seed
# Start the backend server
npm run dev
```
The backend will launch on `http://localhost:5000`.

### 2. Set Up the Frontend Next.js Client
Open a new terminal shell in the project root directory:
```bash
# Start the development client
npm run dev
```
The client will launch on `http://localhost:3000`. Open it in your web browser.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts.
* **Backend**: Node.js, Express.js, JWT, Mongoose, Bcryptjs.
* **Database**: MongoDB (Production) / Local JSON file `db.json` (Local fallback).

---

## 🌎 Production Deployment

- **Frontend**: Connect your GitHub repository to **Vercel** and set the Environment Variable `NEXT_PUBLIC_API_URL` to your backend endpoint.
- **Backend**: Deployed on **Render** or **Railway** with your production `MONGODB_URI` database URL connection string.
