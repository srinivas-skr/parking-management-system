package com.parking.controller;

import com.parking.dto.request.VehicleRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.entity.Vehicle;
import com.parking.security.UserPrincipal;
import com.parking.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Vehicles", description = "Vehicle management APIs")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping
    @Operation(summary = "Register Vehicle", description = "Register a new vehicle")
    public ResponseEntity<ApiResponse> registerVehicle(
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Vehicle vehicle = vehicleService.registerVehicle(request, currentUser.getId());
        return new ResponseEntity<>(
                ApiResponse.success("Vehicle registered successfully", vehicle),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @Operation(summary = "Get My Vehicles", description = "Get all vehicles of current user")
    public ResponseEntity<List<Vehicle>> getMyVehicles(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(vehicleService.getUserVehicles(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Vehicle by ID", description = "Get vehicle details by ID")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Vehicle", description = "Delete a registered vehicle")
    public ResponseEntity<ApiResponse> deleteVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        vehicleService.deleteVehicle(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully"));
    }
}
