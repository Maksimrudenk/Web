package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.dto.BookingUpdateRequest;
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
import org.study.taxi.type.UserRole;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PriceService priceService;

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

    public List<Booking> findAllForUser(String email) {
        User user = getUserByEmail(email);
        if (user.getRole() == UserRole.ADMIN) {
            return bookingRepository.findAll();
        }
        return bookingRepository.findAll().stream().filter(b -> b.getUser().getId().equals(user.getId())).toList();
    }


    public Booking findByIdForUser(Long id, String email) {
        Booking booking = getBookingById(id);
        ensureAccess(booking, email);
        return booking;
    }

    public Booking updateBooking(Long id, BookingUpdateRequest request, String email) {
        Booking booking = getBookingById(id);
        ensureAccess(booking, email);

        if (request.status() != null) booking.setStatus(request.status());

        if (request.carId() != null) {
            Car car = carRepository.findById(request.carId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));
            booking.setCar(car);
            recalculatePrice(booking);
        }

        if (request.price() != null) {
            booking.setPrice(request.price());
        }

        return bookingRepository.save(booking);
    }


    public void deleteBooking(Long id, String email) {
        Booking booking = getBookingById(id);
        ensureAccess(booking, email);
        bookingRepository.delete(booking);
    }

    private void ensureAccess(Booking booking, String email) {
        User actor = getUserByEmail(email);
        if (actor.getRole() == UserRole.ADMIN) return;
        if (!booking.getUser().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private void recalculatePrice(Booking booking) {
        if (booking instanceof HireBooking hireBooking) {
            booking.setPrice(priceService.calculateHirePrice(booking.getTimeStart(), hireBooking.getHireEnd(), booking.getCar()));
        } else if (booking instanceof TripBooking tripBooking) {
            booking.setPrice(priceService.calculateTripPrice(tripBooking.getPickupLocation(), tripBooking.getDestination(), booking.getCar()));
        }
    }

    private void validateRequiredFields(CreateBookingRequest request) {
        if (request.bookingType() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking type is required");
        if (request.userId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        if (request.carId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Car id is required");
    }

    private Booking buildBookingByType(CreateBookingRequest request, Car car) {
        LocalDateTime start = resolveTimeStart(request.timeStart());

        if (request.bookingType() == BookingType.HIRE) {
            if (request.hireEnd() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hire end is required for HIRE booking");
            HireBooking booking = new HireBooking();
            booking.setHireEnd(request.hireEnd());
            booking.setPrice(priceService.calculateHirePrice(start, request.hireEnd(), car));
            return booking;
        }

        if (request.bookingType() == BookingType.TRIP) {
            if (request.pickupLocation() == null || request.destination() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup location and destination are required for TRIP booking");
            }
            TripBooking booking = new TripBooking();
            booking.setPickupLocation(request.pickupLocation());
            booking.setDestination(request.destination());
            booking.setPrice(priceService.calculateTripPrice(request.pickupLocation(), request.destination(), car));
            return booking;
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported booking type");
    }

    private LocalDateTime resolveTimeStart(LocalDateTime timeStart) {
        return timeStart != null ? timeStart : LocalDateTime.now();
    }
}