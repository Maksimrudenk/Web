package org.study.taxi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.study.taxi.type.CarClass;

@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String model;

    private String registrationNumber;

    private int seats;

    private double price;

    private CarClass serviceTier;

    private boolean available;
}
