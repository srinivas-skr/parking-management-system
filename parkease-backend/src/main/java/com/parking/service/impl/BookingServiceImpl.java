package com.parking.service.impl;

import com.parking.dto.request.BookingRequest;
import com.parking.dto.response.BookingResponse;
import com.parking.entity.Booking;
import com.parking.entity.ParkingSlot;
import com.parking.entity.User;
import com.parking.entity.Vehicle;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.BookingRepository;
import com.parking.repository.UserRepository;
import com.parking.service.BookingService;
import com.parking.service.ParkingSlotService;
import com.parking.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private ParkingSlotService slotService;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Vehicle vehicle = vehicleService.getVehicleById(request.getVehicleId());
        
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new BadRequestException("Vehicle does not belong to you");
        }
        
        // CHECK: Vehicle must not have any active booking (BOOKED or ACTIVE status)
        List<Booking> activeBookingsForVehicle = bookingRepository.findByVehicleIdAndStatusIn(
            vehicle.getId(), 
            List.of(Booking.BookingStatus.BOOKED, Booking.BookingStatus.ACTIVE)
        );
        if (!activeBookingsForVehicle.isEmpty()) {
            throw new BadRequestException("Vehicle " + vehicle.getVehicleNumber() + 
                " already has an active booking. Please checkout first before making a new booking.");
        }

        ParkingSlot slot = slotService.getSlotById(request.getSlotId());

        if (slot.getSlotStatus() != ParkingSlot.SlotStatus.AVAILABLE) {
            throw new BadRequestException("Parking slot is not available");
        }

        // Check if vehicle type matches slot type
    if (!isVehicleCompatibleWithSlot(vehicle.getVehicleType(), slot.getVehicleType())) {
            throw new BadRequestException("Vehicle type does not match slot type. " +
                    "Vehicle: " + vehicle.getVehicleType() + ", Slot: " + slot.getVehicleType());
        }

        // Generate unique booking code
        String bookingCode = generateBookingCode();

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .slot(slot)
                .bookingCode(bookingCode)
                .expectedCheckOut(request.getExpectedCheckOut())
                .status(Booking.BookingStatus.BOOKED)
                .build();

        booking = bookingRepository.save(booking);

        // Mark slot as occupied
        slotService.markSlotAsOccupied(slot.getId());

        return convertToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse checkIn(Long bookingId, Long userId) {
        Booking booking = getBookingEntity(bookingId);

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("This booking does not belong to you");
        }

        if (booking.getStatus() != Booking.BookingStatus.BOOKED) {
            throw new BadRequestException("Booking is not in BOOKED status");
        }

        booking.setCheckInTime(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        booking = bookingRepository.save(booking);

        return convertToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse checkOut(Long bookingId, Long userId) {
        Booking booking = getBookingEntity(bookingId);

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("This booking does not belong to you");
        }

        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new BadRequestException("Booking is not in ACTIVE status");
        }

        if (booking.getCheckInTime() == null) {
            throw new BadRequestException("Check-in time is missing");
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        booking.setCheckOutTime(checkOutTime);

        // Calculate duration and amount
        Duration duration = Duration.between(booking.getCheckInTime(), checkOutTime);
        double hours = duration.toMinutes() / 60.0;
        BigDecimal totalHours = BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP);
        
            BigDecimal hourlyRate = booking.getSlot().getPricePerHour();
        BigDecimal totalAmount = hourlyRate.multiply(totalHours).setScale(2, RoundingMode.HALF_UP);

        booking.setTotalHours(totalHours);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(Booking.BookingStatus.COMPLETED);

        booking = bookingRepository.save(booking);

        // Mark slot as available
        slotService.markSlotAsAvailable(booking.getSlot().getId());

        return convertToResponse(booking);
    }

    @Override
    public BookingResponse getBookingById(Long id, Long userId) {
        Booking booking = getBookingEntity(id);
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("This booking does not belong to you");
        }
        
        return convertToResponse(booking);
    }

    @Override
    public List<BookingResponse> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findUserBookingsOrderByDate(userId);
        return bookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelBooking(Long id, Long userId) {
        Booking booking = getBookingEntity(id);

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("This booking does not belong to you");
        }

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel completed booking");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Mark slot as available
        slotService.markSlotAsAvailable(booking.getSlot().getId());
    }

    @Override
    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", bookingCode));
        return convertToResponse(booking);
    }

    private Booking getBookingEntity(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    private String generateBookingCode() {
        return "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingResponse convertToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .vehicleNumber(booking.getVehicle().getLicensePlate())
                .slotNumber(booking.getSlot().getSlotNumber())
                .status(booking.getStatus().name())
                .checkInTime(booking.getCheckInTime())
                .checkOutTime(booking.getCheckOutTime())
                .expectedCheckOut(booking.getExpectedCheckOut())
                .totalHours(booking.getTotalHours())
                .totalAmount(booking.getTotalAmount())
                .qrCodePath(booking.getQrCodePath())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    /**
     * Check if vehicle type is compatible with parking slot type
     */
    private boolean isVehicleCompatibleWithSlot(Vehicle.VehicleType vehicleType, ParkingSlot.VehicleType slotVehicleType) {
        return switch (vehicleType) {
            case TWO_WHEELER -> slotVehicleType == ParkingSlot.VehicleType.TWO_WHEELER;
            case FOUR_WHEELER -> slotVehicleType == ParkingSlot.VehicleType.FOUR_WHEELER;
            case HEAVY_VEHICLE -> slotVehicleType == ParkingSlot.VehicleType.HEAVY_VEHICLE;
        };
    }
}
