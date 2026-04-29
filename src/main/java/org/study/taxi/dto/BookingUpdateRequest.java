package org.study.taxi.dto;

import org.study.taxi.type.BookingStatus;

import java.math.BigDecimal;

public record BookingUpdateRequest(
        BookingStatus status,
        Long carId,
        BigDecimal price
) {
}
