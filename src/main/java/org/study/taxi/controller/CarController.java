package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.study.taxi.dto.CarRequest;
import org.study.taxi.dto.CarResponse;
import org.study.taxi.dto.CarSearchRequest;
import org.study.taxi.entity.Car;
import org.study.taxi.service.CarService;
import org.study.taxi.service.SearchService;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final SearchService searchService;
    private final CarService carService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CarResponse createCar(@RequestBody CarRequest request, Authentication authentication) {
        return carService.createCar(request, authentication.getName());
    }

    @GetMapping
    public List<CarResponse> findAll() {
        return carService.findAll();
    }

    @GetMapping("/{id}")
    public CarResponse findById(@PathVariable Long id) {
        return carService.findCarResponseById(id);
    }

    @PutMapping("/{id}")
    public CarResponse updateCar(@PathVariable Long id, @RequestBody CarRequest request, Authentication authentication) {
        return carService.updateCar(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCar(@PathVariable Long id, Authentication authentication) {
        carService.deleteCar(id, authentication.getName());
    }
    @PostMapping("/search")
    public Page<CarResponse> searchCars(@RequestBody CarSearchRequest request) {
        return searchService.searchCars(request);
    }
}
