package com.parking.controller;

import com.parking.dto.request.BookingRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.dto.response.BookingResponse;
import com.parking.security.UserPrincipal;
import com.parking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Bookings", description = "Parking booking management APIs")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create Booking", description = "Create a new parking booking")
    public ResponseEntity<ApiResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        BookingResponse booking = bookingService.createBooking(request, currentUser.getId());
        return new ResponseEntity<>(
                ApiResponse.success("Booking created successfully", booking),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/{id}/checkin")
    @Operation(summary = "Check-In", description = "Check-in to activate booking")
    public ResponseEntity<ApiResponse> checkIn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        BookingResponse booking = bookingService.checkIn(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Checked in successfully", booking));
    }

    @PostMapping("/{id}/checkout")
    @Operation(summary = "Check-Out", description = "Check-out to complete booking and calculate payment")
    public ResponseEntity<ApiResponse> checkOut(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        BookingResponse booking = bookingService.checkOut(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Checked out successfully", booking));
    }

    @GetMapping
    @Operation(summary = "Get My Bookings", description = "Get all bookings of current user")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(bookingService.getUserBookings(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Booking by ID", description = "Get booking details by ID")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUser.getId()));
    }

    @GetMapping("/code/{bookingCode}")
    @Operation(summary = "Get Booking by Code", description = "Get booking details by booking code")
    public ResponseEntity<BookingResponse> getBookingByCode(
            @PathVariable String bookingCode) {
        return ResponseEntity.ok(bookingService.getBookingByCode(bookingCode));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Bookings (Admin)", description = "Get all bookings in the system")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel Booking", description = "Cancel a booking")
    public ResponseEntity<ApiResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        bookingService.cancelBooking(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully"));
    }
}
