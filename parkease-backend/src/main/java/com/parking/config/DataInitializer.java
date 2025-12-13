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
                // Check if users exist; only create users when none exist
                boolean usersExist = userRepository.count() > 0;
                if (!usersExist) {
                    System.out.println("🔄 Initializing database users with sample data...");

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
            } else {
                System.out.println("✅ Users already exist - skipping user creation");
            }

            // Create Parking Slots with Real Bangalore Locations (only add when missing)
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
                        .areaName("Koramangala")
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
                        .areaName("Koramangala")
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
                        .areaName("Indiranagar")
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
                        .areaName("Indiranagar")
                        .latitude(new BigDecimal("12.9715"))
                        .longitude(new BigDecimal("77.6408"))
                        .build());
            }

            // MG Road - Premium Parking (5 car slots + 5 bike slots)
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
                        .areaName("MG Road")
                        .latitude(new BigDecimal("12.9756"))
                        .longitude(new BigDecimal("77.6066"))
                        .build());
            }
            // MG Road - Bike Slots
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "MGR-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(30.0))
                        .locationDescription("MG Road Metro Station - " + slotNumber)
                        .areaName("MG Road")
                        .latitude(new BigDecimal("12.9756"))
                        .longitude(new BigDecimal("77.6066"))
                        .build());
            }

            // Whitefield - IT Park Parking (5 car slots + 5 bike slots)
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
                        .areaName("Whitefield")
                        .latitude(new BigDecimal("12.9698"))
                        .longitude(new BigDecimal("77.7499"))
                        .build());
            }
            // Whitefield - Bike Slots
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "WHT-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(15.0))
                        .locationDescription("Whitefield TTMC - " + slotNumber)
                        .areaName("Whitefield")
                        .latitude(new BigDecimal("12.9771"))
                        .longitude(new BigDecimal("77.7265"))
                        .build());
            }

            // Electronic City - Budget Parking (5 car slots + 5 bike slots)
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
                        .areaName("Electronic City")
                        .latitude(new BigDecimal("12.8451"))
                        .longitude(new BigDecimal("77.6593"))
                        .build());
            }
            // Electronic City - Bike Slots
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "ELC-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(10.0))
                        .locationDescription("Electronic City Infosys Gate - " + slotNumber)
                        .areaName("Electronic City")
                        .latitude(new BigDecimal("12.8426"))
                        .longitude(new BigDecimal("77.6598"))
                        .build());
            }

            // HSR Layout - Residential Area (5 bike slots + 5 car slots)
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
                        .areaName("HSR Layout")
                        .latitude(new BigDecimal("12.9082"))
                        .longitude(new BigDecimal("77.6476"))
                        .build());
            }
            // HSR Layout - Car Slots
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "HSR-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(35.0))
                        .locationDescription("HSR Layout BDA Complex - " + slotNumber)
                        .areaName("HSR Layout")
                        .latitude(new BigDecimal("12.9082"))
                        .longitude(new BigDecimal("77.6476"))
                        .build());
            }

            // Jayanagar - Shopping Complex (3 bike + 3 car + 3 heavy)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "JAY-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(20.0))
                        .locationDescription("Jayanagar 4th Block - " + slotNumber)
                        .areaName("Jayanagar")
                        .latitude(new BigDecimal("12.9250"))
                        .longitude(new BigDecimal("77.5838"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "JAY-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(45.0))
                        .locationDescription("Jayanagar Shopping Complex - " + slotNumber)
                        .areaName("Jayanagar")
                        .latitude(new BigDecimal("12.9250"))
                        .longitude(new BigDecimal("77.5838"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "JAY-HV-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.HEAVY_VEHICLE)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(100.0))
                        .locationDescription("Jayanagar Bus Stand - " + slotNumber)
                        .areaName("Jayanagar")
                        .latitude(new BigDecimal("12.9250"))
                        .longitude(new BigDecimal("77.5838"))
                        .build());
            }

            // BTM Layout - Mixed Parking (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BTM-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(15.0))
                        .locationDescription("BTM Layout 1st Stage - " + slotNumber)
                        .areaName("BTM Layout")
                        .latitude(new BigDecimal("12.9165"))
                        .longitude(new BigDecimal("77.6101"))
                        .build());
            }
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
                        .areaName("BTM Layout")
                        .latitude(new BigDecimal("12.9165"))
                        .longitude(new BigDecimal("77.6101"))
                        .build());
            }

            // Marathahalli - Tech Hub (4 bike + 4 car)
            for (int i = 1; i <= 4; i++) {
                String slotNumber = "MAR-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(20.0))
                        .locationDescription("Marathahalli ORR Parking - " + slotNumber)
                        .areaName("Marathahalli")
                        .latitude(new BigDecimal("12.9591"))
                        .longitude(new BigDecimal("77.6974"))
                        .build());
            }
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
                        .areaName("Marathahalli")
                        .latitude(new BigDecimal("12.9591"))
                        .longitude(new BigDecimal("77.6974"))
                        .build());
            }

            // Kalyan Nagar - Residential & Commercial Area (5 slots)
            for (int i = 1; i <= 5; i++) {
                String slotNumber = "KLN-" + (i <= 2 ? "2W" : "4W") + "-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(i <= 2 ? ParkingSlot.VehicleType.TWO_WHEELER : ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(i <= 2 ? 0 : 1)
                        .slotStatus(i == 3 ? ParkingSlot.SlotStatus.OCCUPIED : ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(i <= 2 ? 20.0 : 50.0))
                        .locationDescription("Kalyan Nagar Main Road - " + slotNumber)
                        .areaName("Kalyan Nagar")
                        .latitude(new BigDecimal("13.0280"))
                        .longitude(new BigDecimal("77.6390"))
                        .build());
            }

            // Malleshwaram - Heritage Area (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "MAL-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(15.0))
                        .locationDescription("Malleshwaram 8th Cross - " + slotNumber)
                        .areaName("Malleshwaram")
                        .latitude(new BigDecimal("13.0096"))
                        .longitude(new BigDecimal("77.5679"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "MAL-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(40.0))
                        .locationDescription("Mantri Mall Malleshwaram - " + slotNumber)
                        .areaName("Malleshwaram")
                        .latitude(new BigDecimal("13.0110"))
                        .longitude(new BigDecimal("77.5705"))
                        .build());
            }

            // Banashankari - Temple Area (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BSK-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(10.0))
                        .locationDescription("Banashankari Temple Road - " + slotNumber)
                        .areaName("Banashankari")
                        .latitude(new BigDecimal("12.9260"))
                        .longitude(new BigDecimal("77.5400"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BSK-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(35.0))
                        .locationDescription("Banashankari TTMC - " + slotNumber)
                        .areaName("Banashankari")
                        .latitude(new BigDecimal("12.9245"))
                        .longitude(new BigDecimal("77.5450"))
                        .build());
            }

            // Yelahanka - North Bangalore (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "YLK-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(10.0))
                        .locationDescription("Yelahanka New Town - " + slotNumber)
                        .areaName("Yelahanka")
                        .latitude(new BigDecimal("13.0690"))
                        .longitude(new BigDecimal("77.5857"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "YLK-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(30.0))
                        .locationDescription("Yelahanka Old Town - " + slotNumber)
                        .areaName("Yelahanka")
                        .latitude(new BigDecimal("13.1000"))
                        .longitude(new BigDecimal("77.5960"))
                        .build());
            }

            // Basavanagudi - Bull Temple Area (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BGD-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(15.0))
                        .locationDescription("Bull Temple Road - " + slotNumber)
                        .areaName("Basavanagudi")
                        .latitude(new BigDecimal("12.9428"))
                        .longitude(new BigDecimal("77.5693"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BGD-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(40.0))
                        .locationDescription("DVG Road Basavanagudi - " + slotNumber)
                        .areaName("Basavanagudi")
                        .latitude(new BigDecimal("12.9450"))
                        .longitude(new BigDecimal("77.5720"))
                        .build());
            }

            // Majestic - Bus/Railway Station (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "MJT-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(20.0))
                        .locationDescription("Majestic KSRTC - " + slotNumber)
                        .areaName("Majestic")
                        .latitude(new BigDecimal("12.9763"))
                        .longitude(new BigDecimal("77.5713"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "MJT-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(50.0))
                        .locationDescription("KSR Railway Station - " + slotNumber)
                        .areaName("Majestic")
                        .latitude(new BigDecimal("12.9719"))
                        .longitude(new BigDecimal("77.5950"))
                        .build());
            }

            // Bellandur - IT Corridor (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BLR-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(15.0))
                        .locationDescription("Bellandur ORR - " + slotNumber)
                        .areaName("Bellandur")
                        .latitude(new BigDecimal("12.9258"))
                        .longitude(new BigDecimal("77.6742"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "BLR-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(45.0))
                        .locationDescription("Prestige Shantiniketan - " + slotNumber)
                        .areaName("Bellandur")
                        .latitude(new BigDecimal("12.9300"))
                        .longitude(new BigDecimal("77.6800"))
                        .build());
            }

            // Airport - Kempegowda International (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "AIR-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(25.0))
                        .locationDescription("BIAL Terminal 1 - " + slotNumber)
                        .areaName("Airport")
                        .latitude(new BigDecimal("13.1986"))
                        .longitude(new BigDecimal("77.7066"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "AIR-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(100.0))
                        .locationDescription("BIAL Long Term Parking - " + slotNumber)
                        .areaName("Airport")
                        .latitude(new BigDecimal("13.1950"))
                        .longitude(new BigDecimal("77.7100"))
                        .build());
            }

            // Rajajinagar - Industrial Area (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "RJN-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(15.0))
                        .locationDescription("Rajajinagar 1st Block - " + slotNumber)
                        .areaName("Rajajinagar")
                        .latitude(new BigDecimal("12.9991"))
                        .longitude(new BigDecimal("77.5560"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "RJN-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(40.0))
                        .locationDescription("Navrang Theatre Rajajinagar - " + slotNumber)
                        .areaName("Rajajinagar")
                        .latitude(new BigDecimal("13.0020"))
                        .longitude(new BigDecimal("77.5590"))
                        .build());
            }

            // Cubbon Park - CBD Area (3 bike + 3 car)
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "CBN-2W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.TWO_WHEELER)
                        .floorNumber(0)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(10.0))
                        .locationDescription("Cubbon Park East Gate - " + slotNumber)
                        .areaName("Cubbon Park")
                        .latitude(new BigDecimal("12.9762"))
                        .longitude(new BigDecimal("77.5929"))
                        .build());
            }
            for (int i = 1; i <= 3; i++) {
                String slotNumber = "CBN-4W-" + String.format("%03d", i);
                slots.add(ParkingSlot.builder()
                        .slotNumber(slotNumber)
                        .vehicleType(ParkingSlot.VehicleType.FOUR_WHEELER)
                        .floorNumber(1)
                        .slotStatus(ParkingSlot.SlotStatus.AVAILABLE)
                        .isActive(true)
                        .pricePerHour(BigDecimal.valueOf(50.0))
                        .locationDescription("Vidhana Soudha Parking - " + slotNumber)
                        .areaName("Cubbon Park")
                        .latitude(new BigDecimal("12.9795"))
                        .longitude(new BigDecimal("77.5913"))
                        .build());
            }

            // Persist slots only if none exist yet. If slots already present, add Kalyan Nagar only if missing.
            if (slotRepository.count() == 0) {
                slotRepository.saveAll(slots);
                System.out.println("✅ Created 55 parking slots across Bangalore");
            } else {
                // If Kalyan Nagar entries are missing, add them specifically
                if (slotRepository.findBySlotNumber("KLN-001").isEmpty()) {
                    List<ParkingSlot> kln = new ArrayList<>();
                    for (int i = 1; i <= 5; i++) {
                        String slotNumber = "KLN-" + (i <= 2 ? "2W" : "4W") + "-" + String.format("%03d", i);
                        kln.add(ParkingSlot.builder()
                                .slotNumber(slotNumber)
                                .vehicleType(i <= 2 ? ParkingSlot.VehicleType.TWO_WHEELER : ParkingSlot.VehicleType.FOUR_WHEELER)
                                .floorNumber(i <= 2 ? 0 : 1)
                                .slotStatus(i == 3 ? ParkingSlot.SlotStatus.OCCUPIED : ParkingSlot.SlotStatus.AVAILABLE)
                                .isActive(true)
                                .pricePerHour(BigDecimal.valueOf(i <= 2 ? 20.0 : 50.0))
                                .locationDescription("Kalyan Nagar Main Road - " + slotNumber)
                                .latitude(new BigDecimal("13.0280"))
                                .longitude(new BigDecimal("77.6390"))
                                .build());
                    }
                    slotRepository.saveAll(kln);
                    System.out.println("✅ Added Kalyan Nagar parking slots to existing database");
                } else {
                    System.out.println("✅ Parking slots already initialized - skipping slot creation");
                }
            }

            System.out.println("\n╔════════════════════════════════════════════╗");
            System.out.println("║   🎉 DATABASE INITIALIZED SUCCESSFULLY!   ║");
            System.out.println("╚════════════════════════════════════════════╝");
            
            // FIX EXISTING SLOTS: Update areaName for slots that don't have it
            updateMissingAreaNames(slotRepository);
            
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
            System.out.println("   📍 Kalyan Nagar: 5 slots (2W + 4W)");
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
    
    /**
     * Updates existing slots that don't have areaName set.
     * This fixes the area filtering issue for production databases.
     */
    private void updateMissingAreaNames(ParkingSlotRepository slotRepository) {
        System.out.println("\n🔧 Checking for slots without areaName...");
        
        java.util.List<ParkingSlot> allSlots = slotRepository.findAll();
        int updatedCount = 0;
        
        for (ParkingSlot slot : allSlots) {
            if (slot.getAreaName() == null || slot.getAreaName().isEmpty()) {
                String inferredArea = inferAreaFromSlot(slot);
                if (inferredArea != null) {
                    slot.setAreaName(inferredArea);
                    slotRepository.save(slot);
                    updatedCount++;
                    System.out.println("   ✅ Updated slot " + slot.getId() + " -> " + inferredArea);
                }
            }
        }
        
        if (updatedCount > 0) {
            System.out.println("   📍 Updated " + updatedCount + " slots with areaName");
        } else {
            System.out.println("   ✓ All slots already have areaName set");
        }
    }
    
    /**
     * Infers the area name from slot's locationDescription
     */
    private String inferAreaFromSlot(ParkingSlot slot) {
        String searchText = "";
        if (slot.getLocationDescription() != null) {
            searchText = slot.getLocationDescription().toLowerCase();
        }
        
        // Check for known areas in Bangalore
        if (searchText.contains("koramangala")) return "Koramangala";
        if (searchText.contains("indiranagar")) return "Indiranagar";
        if (searchText.contains("hsr")) return "HSR Layout";
        if (searchText.contains("whitefield")) return "Whitefield";
        if (searchText.contains("jayanagar")) return "Jayanagar";
        if (searchText.contains("jp nagar") || searchText.contains("jpnagar")) return "JP Nagar";
        if (searchText.contains("electronic city") || searchText.contains("ecity")) return "Electronic City";
        if (searchText.contains("marathahalli")) return "Marathahalli";
        if (searchText.contains("mg road")) return "MG Road";
        if (searchText.contains("brigade road") || searchText.contains("brigade")) return "Brigade Road";
        if (searchText.contains("hebbal")) return "Hebbal";
        if (searchText.contains("yelahanka")) return "Yelahanka";
        if (searchText.contains("bannerghatta")) return "Bannerghatta Road";
        if (searchText.contains("btm")) return "BTM Layout";
        if (searchText.contains("malleshwaram")) return "Malleshwaram";
        if (searchText.contains("rajajinagar")) return "Rajajinagar";
        if (searchText.contains("sadashivanagar")) return "Sadashivanagar";
        if (searchText.contains("basavanagudi")) return "Basavanagudi";
        if (searchText.contains("vijayanagar")) return "Vijayanagar";
        if (searchText.contains("banashankari")) return "Banashankari";
        if (searchText.contains("cunningham")) return "Cunningham Road";
        if (searchText.contains("ulsoor")) return "Ulsoor";
        if (searchText.contains("richmond")) return "Richmond Town";
        if (searchText.contains("lavelle")) return "Lavelle Road";
        if (searchText.contains("residency")) return "Residency Road";
        if (searchText.contains("church street")) return "Church Street";
        if (searchText.contains("ub city")) return "UB City";
        if (searchText.contains("commercial street")) return "Commercial Street";
        if (searchText.contains("majestic")) return "Majestic";
        if (searchText.contains("yeshwanthpur")) return "Yeshwanthpur";
        if (searchText.contains("peenya")) return "Peenya";
        if (searchText.contains("domlur")) return "Domlur";
        if (searchText.contains("sarjapur")) return "Sarjapur Road";
        if (searchText.contains("bellandur")) return "Bellandur";
        if (searchText.contains("brookefield")) return "Brookefield";
        if (searchText.contains("kengeri")) return "Kengeri";
        if (searchText.contains("nagarbhavi")) return "Nagarbhavi";
        
        return "Bangalore"; // Default fallback
    }
}
