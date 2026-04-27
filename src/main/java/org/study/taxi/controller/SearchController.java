package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.study.taxi.dto.CarSearchRequest;
import org.study.taxi.entity.Car;
import org.study.taxi.service.SearchService;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/search")
    public Page<Car> searchCars(@RequestBody CarSearchRequest request) {
        return searchService.searchCars(request);
    }
}
