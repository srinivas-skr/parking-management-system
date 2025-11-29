package com.parking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.parking.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_license_plate", columnList = "license_plate"),
    @Index(name = "idx_vehicle_user", columnList = "user_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = "user")
public class Vehicle extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // Prevent lazy loading error during JSON serialization
    private User user;

    @NotBlank
    @Size(max = 10)
    @Column(name = "license_plate", nullable = false, unique = true, length = 10)
    @JsonProperty("vehicleNumber")  // Expose as vehicleNumber in JSON
    private String licensePlate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 30)
    private VehicleType vehicleType;

    @Size(max = 100)
    @Column(name = "vehicle_model", length = 100)
    private String vehicleModel;

    @Size(max = 30)
    @Column(name = "vehicle_color", length = 30)
    private String vehicleColor;

    public enum VehicleType {
        TWO_WHEELER,
        FOUR_WHEELER,
        HEAVY_VEHICLE
    }
}
