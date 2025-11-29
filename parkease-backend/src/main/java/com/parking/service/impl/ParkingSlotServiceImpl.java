package com.parking.service.impl;

import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSlot.SlotStatus;
import com.parking.entity.ParkingSlot.VehicleType;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSlotRepository;
import com.parking.service.ParkingSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParkingSlotServiceImpl implements ParkingSlotService {

    private final ParkingSlotRepository slotRepository;

    @Override
    @Transactional
    public ParkingSlot createSlot(ParkingSlot slot) {
        if (slotRepository.findBySlotNumber(slot.getSlotNumber()).isPresent()) {
            throw new BadRequestException("Slot number already exists: " + slot.getSlotNumber());
        }
        return slotRepository.save(slot);
    }

    @Override
    @Transactional
    public ParkingSlot updateSlot(Long id, ParkingSlot slotDetails) {
        ParkingSlot slot = getSlotById(id);
        
    slot.setSlotNumber(slotDetails.getSlotNumber());
    slot.setFloorNumber(slotDetails.getFloorNumber());
    slot.setLocationDescription(slotDetails.getLocationDescription());
    slot.setPricePerHour(slotDetails.getPricePerHour());
    slot.setVehicleType(slotDetails.getVehicleType());
    slot.setSlotStatus(slotDetails.getSlotStatus());
    slot.setIsActive(slotDetails.getIsActive());
    slot.setAvailableSpots(slotDetails.getAvailableSpots());
    slot.setLatitude(slotDetails.getLatitude());
    slot.setLongitude(slotDetails.getLongitude());
        
        return slotRepository.save(slot);
    }

    @Override
    @Transactional
    public void deleteSlot(Long id) {
        ParkingSlot slot = getSlotById(id);
        slotRepository.delete(slot);
    }

    @Override
    public ParkingSlot getSlotById(Long id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ParkingSlot", "id", id));
    }

    @Override
    public List<ParkingSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    @Override
    public List<ParkingSlot> getAvailableSlots(VehicleType vehicleType) {
        return slotRepository.findSlotsByStatusAndVehicleType(SlotStatus.AVAILABLE, vehicleType);
    }

    @Override
    public Long countAvailableSlots(VehicleType vehicleType) {
        return slotRepository.countSlotsByStatusAndVehicleType(SlotStatus.AVAILABLE, vehicleType);
    }

    @Override
    @Transactional
    public void markSlotAsOccupied(Long slotId) {
        ParkingSlot slot = getSlotById(slotId);
        if (slot.getSlotStatus() == SlotStatus.OCCUPIED) {
            throw new BadRequestException("Slot is already occupied");
        }
        slot.setSlotStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);
    }

    @Override
    @Transactional
    public void markSlotAsAvailable(Long slotId) {
        ParkingSlot slot = getSlotById(slotId);
        slot.setSlotStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);
    }
}
