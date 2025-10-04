-- Parking Management System Database Initialization Script

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS parking_db;
USE parking_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    role ENUM('USER', 'ADMIN', 'OPERATOR') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE') NOT NULL,
    vehicle_model VARCHAR(100),
    vehicle_color VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicle_number (vehicle_number),
    INDEX idx_user_vehicles (user_id)
);

-- Parking slots table
CREATE TABLE IF NOT EXISTS parking_slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    slot_number VARCHAR(10) UNIQUE NOT NULL,
    slot_type ENUM('TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE') NOT NULL,
    floor_number INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2) DEFAULT 50.00,
    location_description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slot_availability (is_available, slot_type),
    INDEX idx_floor (floor_number)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    expected_check_out TIMESTAMP NULL,
    total_hours DECIMAL(5, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    status ENUM('BOOKED', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'BOOKED',
    qr_code_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES parking_slots(id) ON DELETE CASCADE,
    INDEX idx_booking_code (booking_code),
    INDEX idx_user_bookings (user_id, status),
    INDEX idx_slot_bookings (slot_id, status),
    INDEX idx_booking_dates (check_in_time, check_out_time)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'UPI', 'WALLET') DEFAULT 'CASH',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_payment (booking_id),
    INDEX idx_transaction (transaction_id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@parking.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Rogg.3vqeyJ3.utl/sljRFze', 'System Admin', 'ADMIN');

-- Insert sample parking slots
INSERT INTO parking_slots (slot_number, slot_type, floor_number, hourly_rate, location_description) VALUES
-- Ground Floor - Two Wheelers
('G-2W-01', 'TWO_WHEELER', 0, 20.00, 'Ground Floor - Section A'),
('G-2W-02', 'TWO_WHEELER', 0, 20.00, 'Ground Floor - Section A'),
('G-2W-03', 'TWO_WHEELER', 0, 20.00, 'Ground Floor - Section A'),
('G-2W-04', 'TWO_WHEELER', 0, 20.00, 'Ground Floor - Section B'),
('G-2W-05', 'TWO_WHEELER', 0, 20.00, 'Ground Floor - Section B'),

-- Ground Floor - Four Wheelers
('G-4W-01', 'FOUR_WHEELER', 0, 50.00, 'Ground Floor - Section C'),
('G-4W-02', 'FOUR_WHEELER', 0, 50.00, 'Ground Floor - Section C'),
('G-4W-03', 'FOUR_WHEELER', 0, 50.00, 'Ground Floor - Section D'),
('G-4W-04', 'FOUR_WHEELER', 0, 50.00, 'Ground Floor - Section D'),
('G-4W-05', 'FOUR_WHEELER', 0, 50.00, 'Ground Floor - Section D'),

-- First Floor - Four Wheelers
('F1-4W-01', 'FOUR_WHEELER', 1, 50.00, 'First Floor - Section A'),
('F1-4W-02', 'FOUR_WHEELER', 1, 50.00, 'First Floor - Section A'),
('F1-4W-03', 'FOUR_WHEELER', 1, 50.00, 'First Floor - Section B'),
('F1-4W-04', 'FOUR_WHEELER', 1, 50.00, 'First Floor - Section B'),
('F1-4W-05', 'FOUR_WHEELER', 1, 50.00, 'First Floor - Section B'),

-- First Floor - Two Wheelers
('F1-2W-01', 'TWO_WHEELER', 1, 20.00, 'First Floor - Section C'),
('F1-2W-02', 'TWO_WHEELER', 1, 20.00, 'First Floor - Section C'),
('F1-2W-03', 'TWO_WHEELER', 1, 20.00, 'First Floor - Section C'),
('F1-2W-04', 'TWO_WHEELER', 1, 20.00, 'First Floor - Section D'),
('F1-2W-05', 'TWO_WHEELER', 1, 20.00, 'First Floor - Section D');
