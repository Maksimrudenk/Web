package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.dto.CreateBookingRequest;
import org.study.taxi.entity.Booking;
import org.study.taxi.entity.Car;
import org.study.taxi.entity.HireBooking;
import org.study.taxi.entity.TripBooking;
import org.study.taxi.entity.User;
import org.study.taxi.repository.BookingRepository;
import org.study.taxi.repository.CarRepository;
import org.study.taxi.repository.UserRepository;
import org.study.taxi.type.BookingStatus;
import org.study.taxi.type.BookingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;

    public Booking createBooking(CreateBookingRequest request) {
        validateRequiredFields(request);

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Car car = carRepository.findById(request.carId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));

        Booking booking = buildBookingByType(request,car);
        booking.setUser(user);
        booking.setCar(car);
        booking.setTimeStart(resolveTimeStart(request.timeStart()));
        booking.setStatus(request.status() != null ? request.status() : BookingStatus.CREATED);

        return bookingRepository.save(booking);
    }

    private void validateRequiredFields(CreateBookingRequest request) {
        if (request.bookingType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking type is required");
        }
        if (request.userId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        }
        if (request.carId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Car id is required");
        }
    }

    private Booking buildBookingByType(CreateBookingRequest request, Car car) {
        if (request.bookingType() == BookingType.HIRE) {
            if (request.hireEnd() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hire end is required for HIRE booking");
            }
            HireBooking booking = new HireBooking();
            booking.setHireEnd(request.hireEnd());

            LocalDateTime start = resolveTimeStart(request.timeStart());

            long hours = java.time.Duration
                    .between(start, request.hireEnd())
                    .toHours();

            if (hours <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Hire end must be after start time"
                );
            }

            double totalPrice = hours * car.getPrice();
            booking.setPrice(new BigDecimal(totalPrice));

            return booking;
        }

        if (request.bookingType() == BookingType.TRIP) {
            if (request.pickupLocation() == null || request.destination() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Pickup location and destination are required for TRIP booking");
            }
            TripBooking booking = new TripBooking();
            booking.setPickupLocation(request.pickupLocation());
            booking.setDestination(request.destination());

            double modifierStart = request.pickupLocation().modifier;
            double modifierDestination = request.destination().modifier;

            double extra = request.pickupLocation() != request.destination() ? 1 : 0;

            double totalPrice =
                    (modifierStart + modifierDestination + extra) * car.getPrice();

            booking.setPrice(new BigDecimal(totalPrice));

            return booking;
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported booking type");
    }

    private LocalDateTime resolveTimeStart(LocalDateTime timeStart) {
        return timeStart != null ? timeStart : LocalDateTime.now();
    }
}
