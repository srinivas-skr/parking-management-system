# 🚗 Parking Management System

A **production-ready** Spring Boot REST API for smart parking management with real-time slot availability, QR code generation, JWT authentication, and email notifications.

## 🎯 **Features**

### Core Features
- ✅ **User Authentication** - JWT-based secure login/registration
- ✅ **Vehicle Management** - Register and manage multiple vehicles
- ✅ **Real-time Slot Availability** - View available parking slots by type
- ✅ **Smart Booking** - Book parking slots with automatic pricing
- ✅ **QR Code Generation** - Unique QR codes for each booking
- ✅ **Check-in/Check-out** - Track parking duration automatically
- ✅ **Payment Processing** - Multiple payment methods (Cash, Card, UPI, Wallet)
- ✅ **Email Notifications** - Booking confirmations via email

### Admin Features
- ✅ **Slot Management** - Create, update, delete parking slots
- ✅ **User Management** - View and manage users
- ✅ **Revenue Reports** - Track earnings and statistics
- ✅ **Booking History** - Complete audit trail

## 🛠️ **Tech Stack**

| Category | Technologies |
|----------|-------------|
| **Backend** | Java 17, Spring Boot 3.2.0 |
| **Security** | Spring Security 6, JWT (JJWT 0.12.3) |
| **Database** | MySQL 8.0, Spring Data JPA |
| **Build Tool** | Maven 3.8+ |
| **Documentation** | SpringDoc OpenAPI 3 (Swagger UI) |
| **Email** | Spring Mail |
| **QR Code** | ZXing (Google) |
| **Utilities** | Lombok, ModelMapper |

## 📋 **Prerequisites**

Before running this project, ensure you have:

- ☑️ **JDK 17 or 21** - [Download](https://adoptium.net/)
- ☑️ **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- ☑️ **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/) OR Docker
- ☑️ **Git** - [Download](https://git-scm.com/downloads)
- ☑️ **Postman** (for API testing) - [Download](https://www.postman.com/downloads/)

## 🚀 **Quick Start**

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/parking-management-system.git
cd parking-management-system

# Start MySQL with Docker Compose
docker-compose up -d mysql

# Wait for MySQL to be ready (check health status)
docker-compose ps

# Build and run the application
mvn clean install
mvn spring-boot:run
```

### Option 2: Local MySQL

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE parking_db;
EXIT;

# 2. Update application.properties with your MySQL credentials
# src/main/resources/application.properties
# Change: spring.datasource.username=YOUR_USERNAME
# Change: spring.datasource.password=YOUR_PASSWORD

# 3. Run the application
mvn clean install
mvn spring-boot:run
```

## 🌐 **Access Points**

Once the application starts:

- **API Base URL**: `http://localhost:8080/api`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API Documentation**: `http://localhost:8080/api-docs`

## 📖 **API Endpoints**

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |

### Parking Slots

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/slots` | Get all slots | Public |
| GET | `/api/slots/available` | Get available slots | Public |
| GET | `/api/slots/{id}` | Get slot by ID | Public |
| POST | `/api/slots` | Create new slot | Admin |
| PUT | `/api/slots/{id}` | Update slot | Admin |
| DELETE | `/api/slots/{id}` | Delete slot | Admin |

### Vehicles

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/vehicles` | Get user's vehicles | User |
| POST | `/api/vehicles` | Register vehicle | User |
| DELETE | `/api/vehicles/{id}` | Remove vehicle | User |

### Bookings

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/bookings` | Create booking | User |
| GET | `/api/bookings` | Get user's bookings | User |
| GET | `/api/bookings/{id}` | Get booking details | User |
| POST | `/api/bookings/{id}/checkin` | Check-in | User/Operator |
| POST | `/api/bookings/{id}/checkout` | Check-out | User/Operator |
| DELETE | `/api/bookings/{id}` | Cancel booking | User |

## 🔐 **Default Credentials**

```
Username: admin
Password: admin123
Role: ADMIN
```

## 📝 **Sample API Requests**

### 1. Register User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "phoneNumber": "9876543210"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "john_doe",
    "password": "password123"
  }'
```

### 3. Get Available Slots

```bash
curl -X GET http://localhost:8080/api/slots/available?type=FOUR_WHEELER \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Create Booking

```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "slotId": 5,
    "expectedCheckOut": "2025-10-03T18:00:00"
  }'
```

## 🗂️ **Project Structure**

```
parking-management-system/
├── src/main/java/com/parking/
│   ├── ParkingManagementApplication.java
│   ├── config/              # Configuration classes
│   │   ├── SecurityConfig.java
│   │   └── OpenAPIConfig.java
│   ├── controller/          # REST Controllers
│   ├── dto/                 # Data Transfer Objects
│   ├── entity/              # JPA Entities
│   ├── repository/          # Spring Data JPA Repositories
│   ├── service/             # Business Logic
│   ├── security/            # JWT & Security
│   ├── exception/           # Custom Exceptions
│   └── util/                # Utility Classes
├── src/main/resources/
│   ├── application.properties
│   └── templates/           # Email templates
├── src/test/                # Unit & Integration Tests
├── pom.xml                  # Maven dependencies
├── docker-compose.yml       # Docker configuration
├── init.sql                 # Database initialization
└── README.md
```

## 🧪 **Testing**

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=BookingServiceTest

# Run with coverage
mvn test jacoco:report
```

## 📦 **Building for Production**

```bash
# Build JAR file
mvn clean package

# Run JAR
java -jar target/parking-management-system-1.0.0.jar

# Or build Docker image
docker build -t parking-system:1.0 .
docker run -p 8080:8080 parking-system:1.0
```

## 🌍 **Environment Variables**

For production deployment, set these environment variables:

```bash
export JWT_SECRET=your-super-secret-key-change-this-in-production
export SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/parking_db
export SPRING_DATASOURCE_USERNAME=your-db-username
export SPRING_DATASOURCE_PASSWORD=your-db-password
export EMAIL_USERNAME=your-smtp-email@gmail.com
export EMAIL_PASSWORD=your-smtp-app-password
```

## 🐛 **Troubleshooting**

### MySQL Connection Error

```
Error: Communications link failure
```

**Solution**: Ensure MySQL is running and credentials are correct in `application.properties`

### JWT Token Error

```
Error: Invalid JWT signature
```

**Solution**: Ensure you're using the correct token and it hasn't expired (24 hours validity)

### Port 8080 Already in Use

```
Error: Port 8080 is already in use
```

**Solution**: Change port in `application.properties`:
```properties
server.port=8081
```

## 📈 **Performance Considerations**

- ✅ Database indexes on frequently queried columns
- ✅ Connection pooling with HikariCP
- ✅ Lazy loading for entity relationships
- ✅ Transaction management with `@Transactional`
- ✅ DTO pattern to avoid exposing entities

## 🔒 **Security Features**

- ✅ Password encryption with BCrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration for frontend integration
- ✅ SQL injection prevention with JPA
- ✅ Input validation with Bean Validation

## 📚 **Learning Resources**

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT Introduction](https://jwt.io/introduction)
- [RESTful API Best Practices](https://restfulapi.net/)

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Author**

**Your Name**
- Email: your.email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [Your GitHub](https://github.com/yourusername)

## 🙏 **Acknowledgments**

- Spring Boot Team for the excellent framework
- ZXing project for QR code generation
- JWT.io for JWT implementation guidance

---

**⭐ If you find this project useful, please consider giving it a star!**
#   T r i g g e r   r e d e p l o y   2 0 2 5 - 1 2 - 0 5   1 5 : 1 0  
 