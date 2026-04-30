package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.study.taxi.dto.BookingResponse;
import org.study.taxi.dto.BookingUpdateRequest;
import org.study.taxi.dto.CreateBookingRequest;
import org.study.taxi.entity.Booking;
import org.study.taxi.service.BookingService;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<Booking> findAll(Authentication authentication) {
        return bookingService.findAllForUser(authentication.getName());
    }

    @GetMapping("/{id}")
    public BookingResponse findById(@PathVariable Long id, Authentication authentication) {
        return bookingService.findByIdForUser(id, authentication.getName());
    }

    @PutMapping("/{id}")
    public BookingResponse update(@PathVariable Long id,
            @RequestBody BookingUpdateRequest request,
            Authentication authentication) {
        return bookingService.updateBooking(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        bookingService.deleteBooking(id, authentication.getName());
    }
}