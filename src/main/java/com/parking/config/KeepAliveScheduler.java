package com.parking.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Keep-alive scheduler to prevent H2 database from auto-closing
 * This ensures the application continues running after initialization
 */
@Component
public class KeepAliveScheduler {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveScheduler.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Heartbeat task that runs every 15 seconds to keep application alive
     * Executes a simple query to maintain database connection
     */
    @Scheduled(fixedRate = 15000) // Every 15 seconds
    public void keepAlive() {
        try {
            // Execute simple query to keep connection alive
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Long.class);
            log.info("✅ Keep-alive heartbeat - {} users in database", count);
        } catch (Exception e) {
            log.warn("Keep-alive query failed: {}", e.getMessage());
        }
    }
}
