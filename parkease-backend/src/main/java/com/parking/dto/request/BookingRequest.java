package com.parking.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @Future(message = "Expected check-out must be in the future")
    private LocalDateTime expectedCheckOut;
}
