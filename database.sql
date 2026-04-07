-- DBMS Mini Project: Society Management System
-- Database Schema for Relational Mapping

CREATE DATABASE IF NOT EXISTS society_management;
USE society_management;

-- Table for Users (Members, Guards, Admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    role ENUM('member', 'guard', 'admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    flatNumber VARCHAR(10),
    wing VARCHAR(5),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for Visitor Requests
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guardId VARCHAR(50),
    visitorName VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    flatNumber VARCHAR(10),
    wing VARCHAR(5),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guardId) REFERENCES users(id) ON DELETE SET NULL
);

-- Table for Complaints
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    memberId VARCHAR(50),
    flatNumber VARCHAR(10),
    text TEXT NOT NULL,
    status ENUM('open', 'resolved') DEFAULT 'open',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for Bills
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    targetId VARCHAR(50),
    wing VARCHAR(5),
    flatNumber VARCHAR(10),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    dueDate DATE,
    status ENUM('pending', 'paid') DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (targetId) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample Data for Seeding
INSERT INTO users (id, role, name, phone, flatNumber, wing, password) VALUES 
('admin', 'admin', 'Society Admin', '9000000000', NULL, NULL, 'admin123'),
('guard', 'guard', 'Ramesh Guard', '9123456789', NULL, NULL, 'guard123'),
('A-101', 'member', 'Chinmay Member', '9876543210', '101', 'A', 'member123');
