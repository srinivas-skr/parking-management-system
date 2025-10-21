package com.parking.repository;

import com.parking.entity.Booking;
import com.parking.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Optional<Booking> findByBookingCode(String bookingCode);
    
    List<Booking> findByUserId(Long userId);
    
    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);
    
    List<Booking> findBySlotIdAndStatus(Long slotId, BookingStatus status);
    
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.vehicle LEFT JOIN FETCH b.slot WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findUserBookingsOrderByDate(@Param("userId") Long userId);
    
    @Query("SELECT b FROM Booking b WHERE b.status = :status ORDER BY b.createdAt DESC")
    List<Booking> findByStatusOrderByDate(@Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.status = 'ACTIVE' AND b.checkInTime < :time")
    List<Booking> findActiveBookingsOlderThan(@Param("time") LocalDateTime time);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'ACTIVE'")
    Long countActiveBookingsByUser(@Param("userId") Long userId);
}
