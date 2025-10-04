# 🚀 SETUP GUIDE - Parking Management System

## Step-by-Step Setup Instructions

### 1. Install Prerequisites

#### a) Install JDK 17 or 21
```bash
# Download from: https://adoptium.net/
# Verify installation
java -version
```

#### b) Install Maven
```bash
# Download from: https://maven.apache.org/download.cgi
# Verify installation
mvn -version
```

#### c) Install MySQL (Choose one option)

**Option A: Local MySQL Installation**
```bash
# Download from: https://dev.mysql.com/downloads/
# Install and start MySQL service
```

**Option B: Docker (Recommended)**
```bash
# Install Docker Desktop from: https://www.docker.com/products/docker-desktop/
# Verify installation
docker --version
docker-compose --version
```

### 2. Clone and Setup Project

```bash
# Clone the repository
cd c:\Users\vikas\Documents\Java_fresher
git init parking-management-system
cd parking-management-system

# If you already have the files, skip to next step
```

### 3. Start MySQL Database

**Option A: Using Docker Compose (Recommended)**
```bash
# From project root directory
docker-compose up -d mysql

# Check if MySQL is running
docker-compose ps

# View MySQL logs
docker-compose logs -f mysql
```

**Option B: Using Local MySQL**
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE parking_db;

# Import initial schema
mysql -u root -p parking_db < init.sql

EXIT;
```

### 4. Configure Application

Edit `src/main/resources/application.properties`:

```properties
# If using Docker (default - no change needed)
spring.datasource.url=jdbc:mysql://localhost:3306/parking_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root123

# If using local MySQL, update these:
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 5. Build the Project

```bash
# Clean and install dependencies
mvn clean install

# If build fails, try:
mvn clean install -DskipTests
```

### 6. Run the Application

```bash
# Method 1: Using Maven
mvn spring-boot:run

# Method 2: Using JAR file
java -jar target/parking-management-system-1.0.0.jar
```

### 7. Verify Application is Running

Open your browser and visit:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/actuator/health

You should see:
```
=================================
🚗 Parking Management System Started!
📖 Swagger UI: http://localhost:8080/swagger-ui.html
📄 API Docs: http://localhost:8080/api-docs
=================================
```

### 8. Test the Application

#### Using Swagger UI (Easiest)

1. Go to http://localhost:8080/swagger-ui.html
2. Try the `/api/auth/login` endpoint with default credentials:
   ```json
   {
     "usernameOrEmail": "admin",
     "password": "admin123"
   }
   ```
3. Copy the JWT token from response
4. Click "Authorize" button (top right)
5. Enter: `Bearer YOUR_JWT_TOKEN`
6. Now you can test all APIs!

#### Using Postman

1. **Import Collection**: Create a new collection in Postman

2. **Login Request**:
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Body (JSON):
   ```json
   {
     "usernameOrEmail": "admin",
     "password": "admin123"
   }
   ```

3. **Copy JWT Token** from response

4. **Test Authenticated Endpoint**:
   - Method: GET
   - URL: `http://localhost:8080/api/slots`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer YOUR_JWT_TOKEN`

### 9. Common Issues & Solutions

#### Issue 1: Port 8080 Already in Use
```bash
Error: Web server failed to start. Port 8080 was already in use.
```

**Solution**: Change port in `application.properties`:
```properties
server.port=8081
```

#### Issue 2: MySQL Connection Error
```bash
Error: Communications link failure
```

**Solutions**:
1. Check if MySQL is running:
   ```bash
   # For Docker
   docker-compose ps
   
   # For local MySQL (Windows)
   services.msc
   # Find "MySQL" service and ensure it's running
   ```

2. Verify credentials in `application.properties`

3. Check MySQL is listening on port 3306:
   ```bash
   netstat -an | findstr 3306
   ```

#### Issue 3: Build Fails with Lombok Errors
```bash
Error: cannot find symbol
```

**Solution**:
1. Ensure Lombok is installed in your IDE
2. Enable annotation processing in IDE settings
3. Rebuild project: `mvn clean install`

#### Issue 4: JWT Secret Error
```bash
Error: The specified key byte array is 0 bits
```

**Solution**: The JWT secret is too short. Set environment variable:
```bash
# Windows PowerShell
$env:JWT_SECRET="myVeryLongSecretKeyThatIsAtLeast256BitsLongForProductionUseOnly"

# Then run
mvn spring-boot:run
```

### 10. Email Configuration (Optional)

To enable email notifications:

1. Get Gmail App Password:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Generate App Password

2. Update `application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-digit-app-password
```

### 11. Database GUI (Optional but Recommended)

Install a database client to view data:

- **DBeaver** (Free): https://dbeaver.io/download/
- **MySQL Workbench**: https://dev.mysql.com/downloads/workbench/

Connection details:
```
Host: localhost
Port: 3306
Database: parking_db
Username: root
Password: root123
```

### 12. Development Workflow

```bash
# 1. Make code changes

# 2. Stop the running application (Ctrl+C)

# 3. Rebuild and run
mvn clean spring-boot:run

# Or for faster development (no clean)
mvn spring-boot:run
```

### 13. Stopping the Application

```bash
# Stop Spring Boot application
# Press Ctrl+C in the terminal

# Stop MySQL Docker container
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### 14. Next Steps After Setup

Once running successfully:

1. ✅ Test all APIs via Swagger UI
2. ✅ Register a new user
3. ✅ Add a vehicle
4. ✅ Check available parking slots
5. ✅ Create a booking
6. ✅ Test check-in/check-out flow

### 15. Production Deployment (Later)

For deploying to production:

1. Set environment variables for sensitive data
2. Change `spring.jpa.hibernate.ddl-auto` to `validate`
3. Use proper JWT secret
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up database backups

### 🆘 Need Help?

If you encounter any issues:

1. Check application logs in the console
2. Check MySQL logs: `docker-compose logs mysql`
3. Verify all prerequisites are installed
4. Ensure all ports (8080, 3306) are available
5. Review the error message carefully

### ✅ Success Checklist

- [ ] JDK 17+ installed and verified
- [ ] Maven installed and verified
- [ ] MySQL running (Docker or local)
- [ ] Project built successfully
- [ ] Application started without errors
- [ ] Swagger UI accessible
- [ ] Login with default credentials works
- [ ] Can view parking slots

**🎉 Once all checked, you're ready to develop!**
