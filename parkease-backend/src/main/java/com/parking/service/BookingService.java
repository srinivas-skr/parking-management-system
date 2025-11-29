package com.parking.service;

import com.parking.dto.request.BookingRequest;
import com.parking.dto.response.BookingResponse;
import com.parking.entity.Booking;

import java.util.List;

public interface BookingService {
    
    BookingResponse createBooking(BookingRequest request, Long userId);
    
    BookingResponse checkIn(Long bookingId, Long userId);
    
    BookingResponse checkOut(Long bookingId, Long userId);
    
    BookingResponse getBookingById(Long id, Long userId);
    
    List<BookingResponse> getUserBookings(Long userId);
    
    List<BookingResponse> getAllBookings();
    
    void cancelBooking(Long id, Long userId);
    
    BookingResponse getBookingByCode(String bookingCode);
}
