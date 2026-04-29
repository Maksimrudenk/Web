package org.study.taxi.dto;

import org.study.taxi.type.CarClass;

public record CarRequest(
        String model,
        String registrationNumber,
        Integer seats,
        Double price,
        CarClass serviceTier,
        Boolean available
) {
}
