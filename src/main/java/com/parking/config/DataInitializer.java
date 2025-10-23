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

            // Create Parking Slots with Real Bangalore Locations
            List<ParkingSlot> slots = new ArrayList<>();

            // Koramangala Area - Two Wheeler Slots (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "KOR-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(20.0))
                        .locationDescription("Koramangala Forum Mall - " + slotNumber)
                        .latitude(new BigDecimal("12.9352"))
                        .longitude(new BigDecimal("77.6245"))
                        .build());
            }

            // Koramangala - Four Wheeler Slots (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "KOR-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(50.0))
                        .locationDescription("Koramangala Metro Station - " + slotNumber)
                        .latitude(new BigDecimal("12.9348"))
                        .longitude(new BigDecimal("77.6250"))
                        .build());
            }

            // Indiranagar - Two Wheeler Slots (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "IND-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(25.0))
                        .locationDescription("Indiranagar 100ft Road - " + slotNumber)
                        .latitude(new BigDecimal("12.9719"))
                        .longitude(new BigDecimal("77.6412"))
                        .build());
            }

            // Indiranagar - Four Wheeler Slots (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "IND-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(i <= 2 ? ParkingSlot.SlotStatus.OCCUPIED : ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(60.0))
                        .locationDescription("Indiranagar Metro - " + slotNumber)
                        .latitude(new BigDecimal("12.9715"))
                        .longitude(new BigDecimal("77.6408"))
                        .build());
            }

            // MG Road - Premium Parking (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "MGR-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(2)
                        .slotStatus(i <= 1 ? ParkingSlot.SlotStatus.RESERVED : ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(80.0))
                        .locationDescription("MG Road Brigade Road Junction - " + slotNumber)
                        .latitude(new BigDecimal("12.9756"))
                        .longitude(new BigDecimal("77.6066"))
                        .build());
            }

            // Whitefield - IT Park Parking (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "WHT-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(40.0))
                        .locationDescription("Whitefield ITPL Tech Park - " + slotNumber)
                        .latitude(new BigDecimal("12.9698"))
                        .longitude(new BigDecimal("77.7499"))
                        .build());
            }

            // Electronic City - Budget Parking (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "ELC-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(30.0))
                        .locationDescription("Electronic City Phase 1 - " + slotNumber)
                        .latitude(new BigDecimal("12.8451"))
                        .longitude(new BigDecimal("77.6593"))
                        .build());
            }

            // HSR Layout - Residential Area (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "HSR-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(15.0))
                        .locationDescription("HSR Layout Sector 1 - " + slotNumber)
                        .latitude(new BigDecimal("12.9082"))
                        .longitude(new BigDecimal("77.6476"))
                        .build());
            }

            // Jayanagar - Heavy Vehicle Bay (3 slots)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "JAY-HV-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.HEAVY_VEHICLE)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(100.0))
                        .locationDescription("Jayanagar Shopping Complex - " + slotNumber)
                        .latitude(new BigDecimal("12.9250"))
                        .longitude(new BigDecimal("77.5838"))
                        .build());
            }

            // BTM Layout - Mixed Parking (3 slots)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BTM-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(i == 1 ? ParkingSlot.SlotStatus.MAINTENANCE : ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(45.0))
                        .locationDescription("BTM Layout 2nd Stage - " + slotNumber)
                        .latitude(new BigDecimal("12.9165"))
                        .longitude(new BigDecimal("77.6101"))
                        .build());
            }

            // Marathahalli - Tech Hub (4 slots)
            for (int i = 1; i <= 4; i++) {
                String slotNumber = "MAR-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(55.0))
                        .locationDescription("Marathahalli Bridge Junction - " + slotNumber)
                        .latitude(new BigDecimal("12.9591"))
                        .longitude(new BigDecimal("77.6974"))
                        .build());
            }

            slotRepository.saveAll(slots);
            System.out.println("✅ Created 50 parking slots across Bangalore");

            System.out.println("\n╔════════════════════════════════════════════╗");
            System.out.println("║   🎉 DATABASE INITIALIZED SUCCESSFULLY!   ║");
            System.out.println("╚════════════════════════════════════════════╝");
            System.out.println("\n📝 Sample Login Credentials:");
            System.out.println("   👤 Admin    → username: admin    | password: admin123");
            System.out.println("   👤 User     → username: user     | password: user123");
            System.out.println("   👤 Operator → username: operator | password: operator123");
            System.out.println("\n🅿️ Parking Slots Created Across Bangalore:");
            System.out.println("   📍 Koramangala: 10 slots (2W + 4W)");
            System.out.println("   📍 Indiranagar: 10 slots (2W + 4W)");
            System.out.println("   📍 MG Road: 5 slots (Premium 4W)");
            System.out.println("   📍 Whitefield: 5 slots (IT Park 4W)");
            System.out.println("   📍 Electronic City: 5 slots (Budget 4W)");
            System.out.println("   📍 HSR Layout: 5 slots (2W)");
            System.out.println("   📍 Jayanagar: 3 slots (Heavy Vehicle)");
            System.out.println("   📍 BTM Layout: 3 slots (4W)");
            System.out.println("   📍 Marathahalli: 4 slots (4W)");
            System.out.println("\n🗺️ Features:");
            System.out.println("   • Interactive Map View with Real Bangalore Locations");
            System.out.println("   • Location-based Search & Filters");
            System.out.println("   • Distance Calculator from User Location");
            System.out.println("   • Multiple Price Ranges (₹15-₹100/hour)");
            System.out.println("\n🌐 Access Application:");
            System.out.println("   • Swagger UI: http://localhost:8080/swagger-ui.html");
            System.out.println("   • H2 Console: http://localhost:8080/h2-console");
            System.out.println("   • Frontend: http://localhost:5173");
            System.out.println("\n════════════════════════════════════════════\n");
            } catch (Exception e) {
                System.err.println("❌ ERROR initializing database:");
                e.printStackTrace();
                throw e;
            }
        };
    }
}
