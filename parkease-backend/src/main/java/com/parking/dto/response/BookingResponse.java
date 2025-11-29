package com.parking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private String bookingCode;
    private String vehicleNumber;
    private String slotNumber;
    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private LocalDateTime expectedCheckOut;
    private BigDecimal totalHours;
    private BigDecimal totalAmount;
    private String qrCodePath;
    private LocalDateTime createdAt;
}
