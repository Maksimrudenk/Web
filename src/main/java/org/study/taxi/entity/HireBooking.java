package org.study.taxi.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("HIRE")
public class HireBooking extends Booking {

    private LocalDateTime hireEnd;
}
