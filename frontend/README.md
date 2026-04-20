# 🩸 BloodFlow - Blood Donation Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)

---

## 📌 Project Overview

### 🩸 Blood Donation Management Web Application

**BloodFlow** is a modern, full-featured web application designed to streamline and manage blood donation activities. Built with the **MERN Stack (MongoDB, Express, React, Node.js)** and powered by **React (Vite)**, it provides a user-friendly platform for **donors, recipients, and administrators**.

The system enables efficient handling of donation requests, real-time tracking, and secure data management. With advanced search, role-based dashboards, and analytics, it helps organizations and communities facilitate blood donation more effectively.

It also integrates third-party services like **Stripe** for funding, making it a complete and scalable solution.

---

## 🚀 Core Features

- 🔐 User authentication (login & registration)
- 👥 Role-based access control (Admin, Donor, Volunteer)
- 📊 Dedicated dashboards for users and admins
- 🩸 Blood donation request management system
- 🔎 Donor search and advanced filtering
- 📈 Donation statistics and analytics (charts)
- 👤 User profile management
- 🔔 Real-time notification system
- 📱 Responsive and modern UI design
- 📊 Data visualization (donations, funding, user activity)
- 🛠️ Admin panel for managing users, donations, and funding
- 📄 PDF export and report generation
- 📍 Location-based search (districts & divisions)
- 🔗 Secure API integration
- ⚠️ Error handling and loading states
- 🌗 Theme support (Light/Dark mode)
- 💳 Payment & funding integration (Stripe)
- 🖼️ Image upload functionality

---

## 🛠️ Tech Stack

### **Frontend**

- React.js (Vite)
- Tailwind CSS
- Context API / Redux Toolkit
- Recharts / Chart.js

### **Backend**

- Node.js
- Express.js
- JWT Authentication
- Bcrypt.js

### **Database & Storage**

- MongoDB Atlas
- Mongoose
- Cloudinary (Image Upload)

---

## 🏗️ Folder Structure

```text
blood-donation-app/
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page views (Dashboard, Login, Search)
│   │   ├── services/      # API logic (Axios)
│   │   └── context/       # Global State (Auth, Theme)
├── server/                # Backend (Node + Express)
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & error handling
│   └── config/            # DB & environment config
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/bloodflow.git
cd bloodflow
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the **server** directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_config
STRIPE_SECRET=your_stripe_key
```

---

## 📊 Key Highlights

- Real-time donation tracking
- Advanced donor search system
- Secure authentication & API handling
- Interactive charts & analytics
- Scalable MERN architecture

---

## 🎯 Use Cases

- 🏥 Hospitals managing blood requests
- 🤝 NGOs organizing donation campaigns
- 🌍 Community-based donor networks
- 🚨 Emergency blood request coordination

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 💡 Future Improvements

- 📱 Mobile app integration
- 🤖 AI-based donor matching
- 📩 SMS & email notification system
- 📍 Live geo-location tracking

---

## ❤️ Acknowledgement

Built with the goal of saving lives through technology and making blood donation more accessible and efficient.
