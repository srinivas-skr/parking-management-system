# 🐳 Docker Deployment Guide
## Parking Management System - Production Deployment

---

## 📋 Prerequisites

- **Docker Engine:** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose:** 2.0+ (included with Docker Desktop)
- **System Requirements:**
  - 2GB RAM minimum (4GB recommended)
  - 10GB disk space
  - Port 8080 and 3306 available

---

## 🚀 Quick Start

### Step 1: Clone/Navigate to Project

```bash
cd parking-management-system
```

### Step 2: Configure Environment Variables

Copy the example environment file:

```bash
# Linux/Mac
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env` file with your values:

```env
DB_PASSWORD=your_strong_password
JWT_SECRET=your_256_bit_secret_key
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 3: Build Docker Image

**Option A: Using Build Script (Recommended)**

```bash
# Linux/Mac
chmod +x docker-build.sh
./docker-build.sh

# Windows PowerShell
.\docker-build.ps1
```

**Option B: Manual Build**

```bash
docker build -t parking-system:latest .
```

### Step 4: Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 5: Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View application logs
docker-compose -f docker-compose.prod.yml logs -f parking-app

# Check health
curl http://localhost:8080/actuator/health
```

---

## 📦 Docker Image Details

**Multi-Stage Build:**
- **Stage 1:** Maven build with JDK 21 (~600MB)
- **Stage 2:** Runtime with JRE 21 Alpine (~200MB final image)

**Security Features:**
- ✅ Non-root user (spring:spring)
- ✅ Minimal Alpine Linux base
- ✅ Health checks enabled
- ✅ Security-hardened JVM options

**Performance:**
- ✅ G1 Garbage Collector
- ✅ Memory limits: 512MB-1024MB
- ✅ Connection pooling (HikariCP)

---

## 🎯 Common Commands

### Start Services

```bash
# Start in detached mode
docker-compose -f docker-compose.prod.yml up -d

# Start with logs
docker-compose -f docker-compose.prod.yml up
```

### Stop Services

```bash
# Stop containers (preserves data)
docker-compose -f docker-compose.prod.yml stop

# Stop and remove containers
docker-compose -f docker-compose.prod.yml down

# Stop and remove everything (including volumes)
docker-compose -f docker-compose.prod.yml down -v
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f parking-app
docker-compose -f docker-compose.prod.yml logs -f mysql
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart parking-app
```

### Rebuild and Restart

```bash
# Rebuild application and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Force recreate containers
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Execute Commands in Container

```bash
# Access application shell
docker exec -it parking-app-prod sh

# Access MySQL shell
docker exec -it parking-mysql-prod mysql -u parking_user -p parking_db
```

---

## 📊 Monitoring

### Check Container Status

```bash
# List running containers
docker-compose -f docker-compose.prod.yml ps

# Container stats (CPU, Memory)
docker stats parking-app-prod parking-mysql-prod
```

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# MySQL health
docker exec parking-mysql-prod mysqladmin ping -h localhost
```

### View Resource Usage

```bash
# Detailed container info
docker inspect parking-app-prod

# Disk usage
docker system df
```

---

## 🔧 Configuration

### Environment Variables

The application accepts the following environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SPRING_DATASOURCE_URL` | MySQL connection URL | - | Yes |
| `SPRING_DATASOURCE_USERNAME` | Database username | parking_user | Yes |
| `SPRING_DATASOURCE_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | JWT signing key (256-bit) | - | Yes |
| `JWT_EXPIRATION` | Token expiration (ms) | 86400000 | No |
| `EMAIL_USERNAME` | SMTP username | - | No |
| `EMAIL_PASSWORD` | SMTP password | - | No |
| `CORS_ORIGINS` | Allowed CORS origins | - | No |

### Volume Management

**MySQL Data Persistence:**

```bash
# Backup MySQL data
docker run --rm -v parking-management-system_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data

# Restore MySQL data
docker run --rm -v parking-management-system_mysql_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/mysql-backup.tar.gz --strip 1"
```

---

## 🔒 Production Checklist

### Security

- [ ] Change default `DB_PASSWORD` in `.env`
- [ ] Generate secure `JWT_SECRET` (256+ bits)
- [ ] Configure `CORS_ORIGINS` for your frontend domain
- [ ] Set up email credentials (use app-specific password)
- [ ] Disable Swagger UI in production
- [ ] Enable HTTPS with reverse proxy (Nginx/Traefik)

### Performance

- [ ] Configure resource limits in `docker-compose.prod.yml`
- [ ] Set up database connection pooling (already configured)
- [ ] Configure JVM memory based on available RAM
- [ ] Enable database query caching

### Monitoring

- [ ] Set up log aggregation (ELK, Loki)
- [ ] Configure metrics collection (Prometheus)
- [ ] Set up alerting (Grafana, PagerDuty)
- [ ] Enable application performance monitoring (APM)

### Backup

- [ ] Schedule automated database backups
- [ ] Test restore procedures
- [ ] Store backups off-site
- [ ] Document backup retention policy

### High Availability

- [ ] Set up load balancer
- [ ] Configure multiple app instances
- [ ] Set up MySQL replication/clustering
- [ ] Implement health check monitoring

---

## 🐛 Troubleshooting

### Application Won't Start

**Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs parking-app
```

**Common issues:**
- Database not ready: Wait for MySQL health check
- Port conflict: Change port in docker-compose.prod.yml
- Memory issue: Increase Docker memory limits

### Database Connection Failed

**Check MySQL logs:**
```bash
docker-compose -f docker-compose.prod.yml logs mysql
```

**Verify connection:**
```bash
docker exec -it parking-mysql-prod mysql -u parking_user -p
```

### Port Already in Use

**Find process using port:**
```bash
# Linux/Mac
lsof -i :8080

# Windows PowerShell
netstat -ano | findstr :8080
```

**Change port in docker-compose.prod.yml:**
```yaml
services:
  parking-app:
    ports:
      - "8081:8080"  # Change host port
```

### Out of Memory

**Increase JVM memory:**
```yaml
environment:
  JAVA_OPTS: "-Xms1024m -Xmx2048m -XX:+UseG1GC"
```

### Clear Everything and Restart

```bash
# Stop and remove all containers, networks, and volumes
docker-compose -f docker-compose.prod.yml down -v

# Remove image
docker rmi parking-system:latest

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🌐 Reverse Proxy Setup (Nginx)

Example Nginx configuration for production:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📈 Scaling

### Horizontal Scaling

```yaml
services:
  parking-app:
    deploy:
      replicas: 3
```

### Load Balancing

Use Nginx or Traefik as load balancer:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - parking-app
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [MySQL Docker Guide](https://hub.docker.com/_/mysql)

---

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verify environment variables in `.env`
3. Ensure ports 8080 and 3306 are available
4. Check Docker daemon status: `docker info`
5. Review project documentation in `README.md`

---

**Last Updated:** October 5, 2025  
**Version:** 1.0.0
