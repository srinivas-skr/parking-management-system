# Multi-stage Dockerfile for Parking Management System
# Stage 1: Maven Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy Maven files first for better caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime with JRE
FROM eclipse-temurin:17-jre-alpine

# Add labels for better container management
LABEL maintainer="your.email@example.com"
LABEL version="1.0.0"
LABEL description="Spring Boot Parking Management System"

WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose application port
EXPOSE 8080

# Set JVM options optimized for Fly.io
ENV JAVA_OPTS="-Xmx200m -Xms128m -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
