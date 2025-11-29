package com.parking.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    // Public health endpoint for Render health checks
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("message", "Parking Management System is running successfully!");
        return health;
    }

    // Additional API health endpoint
    @GetMapping("/api/health")
    public Map<String, Object> apiHealth() {
        return health();
    }
    
    @GetMapping("/api/health/ping")
    public String ping() {
        return "pong - Server is alive at " + LocalDateTime.now();
    }
}
