package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.study.taxi.dto.CarResponse;
import org.study.taxi.dto.CarSearchRequest;
import org.study.taxi.entity.Car;
import org.study.taxi.repository.CarRepository;

@Service
@RequiredArgsConstructor
public class SearchService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;

    private final CarRepository carRepository;

    public Page<CarResponse> searchCars(CarSearchRequest request) {

        int page = request.page() != null && request.page() >= 0
                ? request.page()
                : DEFAULT_PAGE;
        int size = request.size() != null && request.size() > 0
                ? request.size()
                : DEFAULT_SIZE;

        Pageable pageable = PageRequest.of(page, size);

        return carRepository.searchAvailableCars(
                normalizeModel(request.model()),
                normalizeMaxPrice(request.maxPrice()),
                request.serviceTier(),
                normalizeSeats(request.seats()),
                pageable
        );
    }

    private String normalizeModel(String model) {
        if (model == null || model.isBlank()) {
            return null;
        }
        return model.trim();
    }

    private Double normalizeMaxPrice(Double maxPrice) {
        if (maxPrice == null || maxPrice <= 0) {
            return null;
        }
        return maxPrice;
    }

    private Integer normalizeSeats(Integer seats) {
        if (seats == null || seats <= 0) {
            return null;
        }
        return seats;
    }
}
