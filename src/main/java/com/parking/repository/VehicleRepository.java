package com.parking.repository;

import com.parking.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    List<Vehicle> findByUserId(Long userId);
    
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    Boolean existsByLicensePlate(String licensePlate);
}
