package com.parking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.parking.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parking_slots", indexes = {
    @Index(name = "idx_parking_slot_number", columnList = "slot_number", unique = true),
    @Index(name = "idx_parking_slot_status", columnList = "slot_status"),
    @Index(name = "idx_parking_slot_location", columnList = "location_description"),
    @Index(name = "idx_parking_slot_geo", columnList = "latitude, longitude")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = "bookings")
public class ParkingSlot extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 10)
    @Column(name = "slot_number", nullable = false, unique = true, length = 10)
    private String slotNumber;

    @NotNull
    @PositiveOrZero
    @Column(name = "floor_number", nullable = false)
    private Integer floorNumber;

    @NotNull
    @PositiveOrZero
    @Column(name = "available_spots", nullable = false)
    @lombok.Builder.Default
    private Integer availableSpots = 0;

    @NotBlank
    @Size(max = 255)
    @Column(name = "location_description", nullable = false, length = 255)
    @com.fasterxml.jackson.annotation.JsonProperty("location")
    private String locationDescription;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 8, fraction = 2)
    @Column(name = "price_per_hour", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerHour;

    @NotNull
    @Column(name = "is_active", nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = Boolean.TRUE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status", nullable = false, length = 20)
    @lombok.Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("status")
    private SlotStatus slotStatus = SlotStatus.AVAILABLE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 20)
    @lombok.Builder.Default
    private VehicleType vehicleType = VehicleType.FOUR_WHEELER;

    @NotNull
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Digits(integer = 3, fraction = 6)
    @Column(name = "latitude", nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @NotNull
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Digits(integer = 3, fraction = 6)
    @Column(name = "longitude", nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @JsonIgnore
    @OneToMany(mappedBy = "slot", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @lombok.Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    public enum SlotStatus {
        AVAILABLE,
        OCCUPIED,
        RESERVED,
        MAINTENANCE
    }

    public enum VehicleType {
        TWO_WHEELER,
        FOUR_WHEELER,
        HEAVY_VEHICLE
    }
}
