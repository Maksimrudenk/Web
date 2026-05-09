package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.dto.PaymentResult;
import org.study.taxi.entity.Booking;
import org.study.taxi.entity.Payment;
import org.study.taxi.repository.BookingRepository;
import org.study.taxi.repository.PaymentRepository;
import org.study.taxi.type.PaymentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentMock implements PaymentGateway {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public Payment createPayment(Long bookingId, String paymentDetails) {
        if (bookingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking id is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        PaymentResult paymentResult = charge(paymentDetails);

        if (!paymentResult.success()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, paymentResult.message());
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getPrice())
                .transactionId(paymentResult.transactionId())
                .status(PaymentStatus.SUCCESS)
                .paymentTime(LocalDateTime.now())
                .paymentDetails(paymentDetails)
                .build();

        return paymentRepository.save(payment);
    }

    private PaymentResult charge(String paymentDetails) {
        if (paymentDetails == null || paymentDetails.isBlank()) {
            return new PaymentResult(false, null, "Invalid card");
        }

        return new PaymentResult(
                true,
                UUID.randomUUID().toString(),
                "Mock payment success"
        );
    }
}
