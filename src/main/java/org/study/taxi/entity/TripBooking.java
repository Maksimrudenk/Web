package org.study.taxi.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TRIP")
public class TripBooking extends Booking {

    private String pickupLocation;
    private String destination;
}