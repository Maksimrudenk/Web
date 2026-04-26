package org.study.taxi.entity;

import jakarta.persistence.*;
import org.study.taxi.type.BookingStatus;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "booking_type")
public abstract class Booking {

    @Id
    @GeneratedValue
    private Long id;

    private BigDecimal price;
    private LocalDateTime timeStart;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

}
