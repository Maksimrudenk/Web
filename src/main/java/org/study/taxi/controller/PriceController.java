package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.study.taxi.dto.HirePriceRequest;
import org.study.taxi.dto.TripPriceRequest;
import org.study.taxi.service.CarService;
import org.study.taxi.service.PriceService;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class PriceController {

    private final PriceService priceService;
    private final CarService carService;

    @PostMapping("/hire")
    public BigDecimal calculateHirePrice(@RequestBody HirePriceRequest request) {
        return priceService.calculateHirePrice(
                request.start(),
                request.hireEnd(),
                carService.findById(request.carId())
        );
    }

    @PostMapping("/trip")
    public BigDecimal calculateTripPrice(@RequestBody TripPriceRequest request) {
        return priceService.calculateTripPrice(
                request.pickupLocation(),
                request.destination(),
                carService.findById(request.carId())
        );
    }
}
