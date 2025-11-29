package com.parking.config;

import com.parking.entity.User;
import com.parking.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Initializes demo user on application startup for guest mode access
 */
@Component
public class DemoUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DemoUserInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        createDemoUser();
    }

    private void createDemoUser() {
        String demoEmail = "demo@parking.com";
        
        // Check if demo user already exists
        if (userRepository.existsByEmail(demoEmail)) {
            logger.info("Demo user already exists: {}", demoEmail);
            return;
        }

        try {
            // Create demo user
            User demoUser = User.builder()
                    .username("demo")
                    .email(demoEmail)
                    .password(passwordEncoder.encode("demo123"))
                    .fullName("Demo User")
                    .phoneNumber("1234567890")
                    .role(User.Role.USER)
                    .isActive(true)
                    .build();

            userRepository.save(demoUser);
            logger.info("✅ Demo user created successfully: {}", demoEmail);
            logger.info("📧 Email: demo@parking.com");
            logger.info("🔑 Password: demo123");
            logger.info("🎯 Use 'Try Demo' button on landing page for instant access");
        } catch (Exception e) {
            logger.error("Failed to create demo user: {}", e.getMessage(), e);
        }
    }
}
