package com.parking.config;

import com.parking.entity.ParkingSlot;
import com.parking.entity.User;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Database Initialization Configuration
 * Loads sample data when application starts
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, 
                                   ParkingSlotRepository slotRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // Check if data already exists
                if (userRepository.count() > 0) {
                    System.out.println("✅ Database already initialized");
                    return;
                }

                System.out.println("🔄 Initializing database with sample data...");

            // Create Admin User
            User admin = User.builder()
                    .username("admin")
                    .email("admin@parking.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .phoneNumber("9876543210")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);

            // Create Regular User
            User user = User.builder()
                    .username("user")
                    .email("user@parking.com")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("John Doe")
                    .phoneNumber("9876543211")
                    .role(User.Role.USER)
                    .build();
            userRepository.save(user);

            // Create Operator User
            User operator = User.builder()
                    .username("operator")
                    .email("operator@parking.com")
                    .password(passwordEncoder.encode("operator123"))
                    .fullName("Parking Operator")
                    .phoneNumber("9876543212")
                    .role(User.Role.OPERATOR)
                    .build();
            userRepository.save(operator);

            System.out.println("✅ Created users: admin, user, operator");

            // Create Parking Slots
            List<ParkingSlot> slots = new ArrayList<>();

            // Two Wheeler Slots (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "A" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(20.0))
                        .locationDescription("Basement Level A - Slot " + slotNumber)
                        .latitude(new BigDecimal("19.0760"))
                        .longitude(new BigDecimal("72.8777"))
                        .build());
            }

            // Four Wheeler Slots (10 slots)
            for (int i = 1; i <= 10; i++) {
                String slotNumber = "B" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(50.0))
                        .locationDescription("Ground Level B - Slot " + slotNumber)
                        .latitude(new BigDecimal("19.0765"))
                        .longitude(new BigDecimal("72.8782"))
                        .build());
            }

            // Heavy Vehicle Slots (3 slots)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "C" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.HEAVY_VEHICLE)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(100.0))
                        .locationDescription("Outdoor Heavy Vehicle Bay - Slot " + slotNumber)
                        .latitude(new BigDecimal("19.0755"))
                        .longitude(new BigDecimal("72.8790"))
                        .build());
            }

            // Handicapped Slots (2 slots)
            for (int i = 1; i <= 2; i++) {
                String slotNumber = "H" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(30.0))
                        .locationDescription("Ground Level Accessible Slot " + slotNumber)
                        .latitude(new BigDecimal("19.0768"))
                        .longitude(new BigDecimal("72.8768"))
                        .build());
            }

            slotRepository.saveAll(slots);
            System.out.println("✅ Created 20 parking slots");

            System.out.println("\n╔════════════════════════════════════════════╗");
            System.out.println("║   🎉 DATABASE INITIALIZED SUCCESSFULLY!   ║");
            System.out.println("╚════════════════════════════════════════════╝");
            System.out.println("\n📝 Sample Login Credentials:");
            System.out.println("   👤 Admin    → username: admin    | password: admin123");
            System.out.println("   👤 User     → username: user     | password: user123");
            System.out.println("   👤 Operator → username: operator | password: operator123");
            System.out.println("\n🅿️ Parking Slots Created:");
            System.out.println("   • Two Wheeler: 5 slots (₹20/hour)");
            System.out.println("   • Four Wheeler: 10 slots (₹50/hour)");
            System.out.println("   • Heavy Vehicle: 3 slots (₹100/hour)");
            System.out.println("   • Handicapped: 2 slots (₹30/hour)");
            System.out.println("\n🌐 Access Application:");
            System.out.println("   • Swagger UI: http://localhost:8080/swagger-ui.html");
            System.out.println("   • H2 Console: http://localhost:8080/h2-console");
            System.out.println("   • Frontend: Open frontend.html in browser");
            System.out.println("\n════════════════════════════════════════════\n");
            } catch (Exception e) {
                System.err.println("❌ ERROR initializing database:");
                e.printStackTrace();
                throw e;
            }
        };
    }
}
