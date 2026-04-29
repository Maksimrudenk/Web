package org.study.taxi.dto;

import org.study.taxi.type.Location;

public record TripPriceRequest(
        Long carId,
        Location pickupLocation,
        Location destination
) {
}
