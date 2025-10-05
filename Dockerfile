# Multi-stage Dockerfile for Parking Management System
# Stage 1: Maven Build
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven files first for better caching
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for faster builds in CI/CD)
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests && \
    mv target/parking-management-system-1.0.0.jar app.jar

# Stage 2: Runtime with JRE
FROM eclipse-temurin:21-jre-alpine

# Add labels for better container management
LABEL maintainer="your.email@example.com"
LABEL version="1.0.0"
LABEL description="Spring Boot Parking Management System"

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/app.jar app.jar

# Change ownership to non-root user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring:spring

# Expose application port
EXPOSE 8080

# Set production profile and JVM options
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
