package org.study.taxi.dto;

import org.study.taxi.entity.Booking;
import org.study.taxi.entity.Car;
import org.study.taxi.entity.HireBooking;
import org.study.taxi.type.BookingStatus;
import org.study.taxi.type.BookingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        BigDecimal price,
        LocalDateTime timeStart,
        BookingStatus status,
        Car car,
        Long userId,
        BookingType bookingType
) {
    public static BookingResponse toResponse(Booking booking) {
        BookingType bookingType = booking instanceof HireBooking? BookingType.HIRE: BookingType.TRIP;
        return new BookingResponse(
                booking.getId(),
                booking.getPrice(),
                booking.getTimeStart(),
                booking.getStatus(),
                booking.getCar(),
                booking.getUser().getId(),
                bookingType
        );
    }
}
