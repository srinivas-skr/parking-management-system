package com.parking.controller;

import com.parking.dto.response.ApiResponse;
import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSlot.VehicleType;
import com.parking.service.ParkingSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@Tag(name = "Parking Slots", description = "Parking slot management APIs")
public class ParkingSlotController {

    @Autowired
    private ParkingSlotService slotService;

    @GetMapping
    @Operation(summary = "Get All Slots", description = "Retrieve all parking slots")
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Slot by ID", description = "Retrieve a specific parking slot")
    public ResponseEntity<ParkingSlot> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.getSlotById(id));
    }

    @GetMapping("/available")
    @Operation(summary = "Get Available Slots", description = "Retrieve available parking slots by type")
    public ResponseEntity<List<ParkingSlot>> getAvailableSlots(
            @RequestParam(required = false) VehicleType type) {
        return ResponseEntity.ok(slotService.getAvailableSlots(type));
    }

    @GetMapping("/count/available")
    @Operation(summary = "Count Available Slots", description = "Get count of available slots by type")
    public ResponseEntity<Map<String, Object>> countAvailableSlots(
            @RequestParam(required = false) VehicleType type) {
        Long count = slotService.countAvailableSlots(type);
        Map<String, Object> response = new HashMap<>();
        response.put("vehicleType", type);
        response.put("availableCount", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create Slot (Admin)", description = "Create a new parking slot")
    public ResponseEntity<ApiResponse> createSlot(@RequestBody ParkingSlot slot) {
        ParkingSlot created = slotService.createSlot(slot);
        return new ResponseEntity<>(
                ApiResponse.success("Slot created successfully", created),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update Slot (Admin)", description = "Update an existing parking slot")
    public ResponseEntity<ApiResponse> updateSlot(
            @PathVariable Long id,
            @RequestBody ParkingSlot slot) {
        ParkingSlot updated = slotService.updateSlot(id, slot);
        return ResponseEntity.ok(ApiResponse.success("Slot updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete Slot (Admin)", description = "Delete a parking slot")
    public ResponseEntity<ApiResponse> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted successfully"));
    }
}
