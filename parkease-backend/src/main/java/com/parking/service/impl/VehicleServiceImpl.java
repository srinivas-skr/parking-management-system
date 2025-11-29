package com.parking.service.impl;

import com.parking.dto.request.VehicleRequest;
import com.parking.entity.User;
import com.parking.entity.Vehicle;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import com.parking.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Vehicle registerVehicle(VehicleRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (vehicleRepository.existsByLicensePlate(request.getVehicleNumber())) {
            throw new BadRequestException("Vehicle number already registered: " + request.getVehicleNumber());
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .licensePlate(request.getVehicleNumber().toUpperCase())
                .vehicleType(request.getVehicleType())
                .vehicleModel(request.getVehicleModel())
                .vehicleColor(request.getVehicleColor())
                .build();

        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getUserVehicles(Long userId) {
        return vehicleRepository.findByUserId(userId);
    }

    @Override
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id, Long userId) {
        Vehicle vehicle = getVehicleById(id);
        
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new BadRequestException("You don't have permission to delete this vehicle");
        }
        
        vehicleRepository.delete(vehicle);
    }
}
