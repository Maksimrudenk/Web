package org.study.taxi.dto;

import org.study.taxi.type.BookingStatus;
import org.study.taxi.type.BookingType;
import org.study.taxi.type.Location;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateBookingRequest(
        BookingType bookingType,
        Long userId,
        Long carId,
        LocalDateTime timeStart,
        BookingStatus status,
        LocalDateTime hireEnd,
        Location pickupLocation,
        Location destination
) {
}
