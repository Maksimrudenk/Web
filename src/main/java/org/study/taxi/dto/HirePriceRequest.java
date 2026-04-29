package org.study.taxi.dto;

import java.time.LocalDateTime;

public record HirePriceRequest(
        Long carId,
        LocalDateTime start,
        LocalDateTime hireEnd
) {
}
