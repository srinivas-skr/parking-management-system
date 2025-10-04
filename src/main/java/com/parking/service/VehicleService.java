package com.parking.service;

import com.parking.dto.request.VehicleRequest;
import com.parking.entity.Vehicle;

import java.util.List;

public interface VehicleService {
    
    Vehicle registerVehicle(VehicleRequest request, Long userId);
    
    List<Vehicle> getUserVehicles(Long userId);
    
    Vehicle getVehicleById(Long id);
    
    void deleteVehicle(Long id, Long userId);
}
