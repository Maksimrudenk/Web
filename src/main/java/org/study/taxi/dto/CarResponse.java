package org.study.taxi.dto;

import org.study.taxi.entity.Car;
import org.study.taxi.type.CarClass;

public record CarResponse(
        Long id,
        String model,
        String registrationNumber,
        int seats,
        double price,
        CarClass serviceTier,
        String imgURL,
        boolean available
) {
    public static CarResponse toResponse(Car car) {
        return new CarResponse(
                car.getId(),
                car.getModel(),
                car.getRegistrationNumber(),
                car.getSeats(),
                car.getPrice(),
                car.getServiceTier(),
                car.getImgURL(),
                car.isAvailable()
        );
    }
}
