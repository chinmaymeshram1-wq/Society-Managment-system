# 🏢 Rahul Downtown Society Management System

A **real-time Society Management System** built using modern web technologies and Firebase. This project provides an efficient platform to manage **members, visitors, complaints, and billing** with role-based access control.

---

## 🚀 Overview

This system is designed as a **Single Page Application (SPA)** with a clean and responsive user interface. It enables smooth communication between residents, security guards, and administrators using **real-time database synchronization**.

---

## 🧰 Tech Stack

* **Frontend:** HTML, CSS, Vanilla JavaScript (SPA)
* **UI Design:** Inter Font, Phosphor Icons
* **Backend:** Firebase Firestore (Real-time Database)
* **Hosting:** GitHub Pages
* **State Management:** LocalStorage + Custom Routing

---

## 👥 User Roles

### 👤 Member

* Login using Flat ID
* Raise and track complaints
* View bills and payment status
* Approve / Reject visitor requests in real-time

---

### 🛡️ Security Guard

* Send visitor approval requests
* Enter visitor details (Name, Phone, Reason)
* View real-time visitor status updates

---

### 👑 Admin (Head of Society)

* Manage all complaints and mark as resolved
* Add / remove members
* Monitor visitor logs
* Generate and manage bills

---

## 🗄️ Database Structure (Firestore)

* **users** → Member, Guard, Admin details
* **visitors** → Visitor requests & approval status
* **complaints** → Issues raised by members
* **bills** → Maintenance and payment tracking

---

## ⚡ Key Features

* 🔄 Real-time updates using Firebase
* 🔐 Role-based authentication system
* 🧭 Custom client-side routing (SPA)
* 📊 Organized dashboards for each role
* 📱 Responsive and user-friendly UI

---

## 🔁 Real-Time Workflow

* Guard sends visitor request → Member receives instantly
* Member approves/rejects → Guard sees update immediately
* Complaints raised → Admin views and resolves in real-time

---

## 🌍 Live Demo

👉 https://chinmaymeshram1-wq.github.io/Society-Management-system/

---

## 📂 Project Structure

```
Society-Management-system/
│
├── index.html
├── style.css
├── js/
│   ├── db.js
│   ├── app.js
│   ├── member.js
│   ├── guard.js
│   └── admin.js
```

---

## 🎯 Highlights

* Clean and modular code structure
* Real-world DBMS implementation
* Seamless integration of frontend with real-time backend
* Scalable and easy to extend

---

## 👨‍💻 Author

**Chinmay Meshram**
Engineering Student | DBMS Project

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
