package org.study.taxi.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.study.taxi.type.Location;

@Entity
@DiscriminatorValue("TRIP")
@Getter
@Setter
@NoArgsConstructor
public class TripBooking extends Booking {

    private Location pickupLocation;
    private Location destination;
}