package org.study.taxi.dto;

import org.study.taxi.type.CarClass;

public record CarSearchRequest(
        String model,
        Double maxPrice,
        CarClass serviceTier,
        Integer seats,
        Integer page,
        Integer size
) {
}
