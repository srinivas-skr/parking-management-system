# Multi-stage Dockerfile for Parking Management System
# Stage 1: Maven Build
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy Maven files first for better caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime with JRE
FROM eclipse-temurin:21-jre-alpine

# Add labels for better container management
LABEL maintainer="your.email@example.com"
LABEL version="1.0.0"
LABEL description="Spring Boot Parking Management System"

WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose application port
EXPOSE 8080

# Set JVM options optimized for Render (512MB max)
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom"

# Health check - Use /actuator/health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=90s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Run the application - Use PORT from environment
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
