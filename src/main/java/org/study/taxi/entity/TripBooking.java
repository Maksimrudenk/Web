package org.study.taxi.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import org.study.taxi.type.Location;

@Entity
@DiscriminatorValue("TRIP")
public class TripBooking extends Booking {

    private Location pickupLocation;
    private Location destination;
}