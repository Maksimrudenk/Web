package org.study.taxi.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.entity.Car;
import org.study.taxi.type.Location;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PriceService {

    public BigDecimal calculateHirePrice(LocalDateTime start, LocalDateTime hireEnd, Car car) {
        long hours = Duration.between(start, hireEnd).toHours();
        if (hours <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hire end must be after start time");
        }

        return BigDecimal.valueOf(hours * car.getPrice());
    }

    public BigDecimal calculateTripPrice(Location pickupLocation, Location destination, Car car) {
        double extra = pickupLocation != destination ? 1 : 0;
        double total = (pickupLocation.modifier + destination.modifier + extra) * car.getPrice();
        return BigDecimal.valueOf(total);
    }
}
