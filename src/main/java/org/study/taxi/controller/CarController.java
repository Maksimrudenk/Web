package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.study.taxi.dto.CarRequest;
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
    public Car createCar(@RequestBody CarRequest request, Authentication authentication) {
        return carService.createCar(request, authentication.getName());
    }

    @GetMapping
    public List<Car> findAll() {
        return carService.findAll();
    }

    @GetMapping("/{id}")
    public Car findById(@PathVariable Long id) {
        return carService.findById(id);
    }

    @PutMapping("/{id}")
    public Car updateCar(@PathVariable Long id, @RequestBody CarRequest request, Authentication authentication) {
        return carService.updateCar(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCar(@PathVariable Long id, Authentication authentication) {
        carService.deleteCar(id, authentication.getName());
    }
    @PostMapping("/search")
    public Page<Car> searchCars(@RequestBody CarSearchRequest request) {
        return searchService.searchCars(request);
    }
}
