package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.dto.CarRequest;
import org.study.taxi.entity.Car;
import org.study.taxi.entity.User;
import org.study.taxi.repository.CarRepository;
import org.study.taxi.repository.UserRepository;
import org.study.taxi.type.UserRole;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public Car createCar(CarRequest request, String email) {
        ensureAdmin(email);
        Car car = new Car();
        applyRequest(car, request);
        return carRepository.save(car);
    }

    public List<Car> findAll() {
        return carRepository.findAll();
    }

    public Car findById(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));
    }

    public Car updateCar(Long id, CarRequest request, String email) {
        ensureAdmin(email);
        Car car = findById(id);
        applyRequest(car, request);
        return carRepository.save(car);
    }

    public void deleteCar(Long id, String email) {
        ensureAdmin(email);
        Car car = findById(id);
        carRepository.delete(car);
    }

    private void ensureAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can manage cars");
        }
    }

    private void applyRequest(Car car, CarRequest request) {
        if (request.model() != null) car.setModel(request.model());
        if (request.registrationNumber() != null) car.setRegistrationNumber(request.registrationNumber());
        if (request.seats() != null) car.setSeats(request.seats());
        if (request.price() != null) car.setPrice(request.price());
        if (request.serviceTier() != null) car.setServiceTier(request.serviceTier());
        if (request.available() != null) car.setAvailable(request.available());
    }
}
