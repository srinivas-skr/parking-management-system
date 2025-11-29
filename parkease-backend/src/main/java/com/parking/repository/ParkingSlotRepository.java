package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSlot.SlotStatus;
import com.parking.entity.ParkingSlot.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    
    Optional<ParkingSlot> findBySlotNumber(String slotNumber);
    
    List<ParkingSlot> findBySlotStatusAndVehicleTypeAndIsActiveTrue(SlotStatus slotStatus, VehicleType vehicleType);

    @Query("SELECT ps FROM ParkingSlot ps WHERE ps.slotStatus = :status AND ps.isActive = true AND (:vehicleType IS NULL OR ps.vehicleType = :vehicleType)")
    List<ParkingSlot> findSlotsByStatusAndVehicleType(@Param("status") SlotStatus status,
                                                      @Param("vehicleType") VehicleType vehicleType);

    @Query("SELECT COUNT(ps) FROM ParkingSlot ps WHERE ps.slotStatus = :status AND ps.isActive = true AND (:vehicleType IS NULL OR ps.vehicleType = :vehicleType)")
    Long countSlotsByStatusAndVehicleType(@Param("status") SlotStatus status,
                                          @Param("vehicleType") VehicleType vehicleType);
}
