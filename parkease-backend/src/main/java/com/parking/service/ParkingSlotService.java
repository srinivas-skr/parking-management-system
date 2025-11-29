package com.parking.service;

import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSlot.VehicleType;

import java.util.List;

public interface ParkingSlotService {
    
    ParkingSlot createSlot(ParkingSlot slot);
    
    ParkingSlot updateSlot(Long id, ParkingSlot slot);
    
    void deleteSlot(Long id);
    
    ParkingSlot getSlotById(Long id);
    
    List<ParkingSlot> getAllSlots();
    
    List<ParkingSlot> getAvailableSlots(VehicleType vehicleType);
    
    Long countAvailableSlots(VehicleType vehicleType);
    
    void markSlotAsOccupied(Long slotId);
    
    void markSlotAsAvailable(Long slotId);
}
