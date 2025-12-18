# 🚗 ParkEase: Smart Parking Management System

[![Java State](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ParkEase** is a comprehensive, production-ready solution for modern parking management. It bridges the gap between drivers and parking providers with real-time slot tracking, easy bookings, and seamless check-ins.

---

## ✨ Key Features

- 📍 **Real-time Map Integration**: Find parking spots near you with interactive Leaflet maps.
- 🕒 **Smart Bookings**: Reserve slots in advance with automated pricing and duration selection.
- 💳 **Seamless Payments**: Multiple payment options for a hassle-free experience.
- 🔐 **Secure Auth**: JWT-based authentication for both Users and Administrators.
- 📊 **Admin Dashboard**: Full control over slots, user management, and revenue tracking.
- 📧 **Instant Notifications**: Receive booking confirmations and QR codes via email.

---

## 📸 Screenshots

| Landing Page | User Dashboard |
| :---: | :---: |
| ![Landing](assets/landing.png) | ![Dashboard](assets/dashboard.png) |

| Interactive Map | Booking Flow |
| :---: | :---: |
| ![Map](assets/map.png) | ![Booking](assets/booking.png) |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Framer Motion (Animations)
- **Maps**: Leaflet / React-Leaflet
- **Icons**: Lucide-React

### Backend
- **Core**: Java 21 & Spring Boot 3.2
- **Security**: Spring Security 6 & JWT
- **Database**: MySQL with Hibernate/JPA
- **QR Engine**: ZXing Google Library
- **Docs**: Swagger UI (OpenAPI 3)

---

## 🚀 Quick Start

### Prerequisites
- JDK 21
- Node.js (v22+)
- MySQL

### Setup
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/parking-management-system.git
   cd parking-management-system
   ```

2. **Backend Setup**
   ```bash
   cd parkease-backend
   # Update src/main/resources/application.properties with your DB credentials
   mvn spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd parkease-frontend
   npm install
   npm run dev
   ```

For detailed deployment instructions (Render/Docker), see [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md).

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**⭐ If you like this project, please give it a star on GitHub!**
