package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.dto.CreatePaymentRequest;
import org.study.taxi.dto.PaymentDTO;
import org.study.taxi.entity.Booking;
import org.study.taxi.entity.Payment;
import org.study.taxi.repository.BookingRepository;
import org.study.taxi.repository.PaymentRepository;
import org.study.taxi.type.BookingStatus;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentGateway paymentGateway;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public PaymentDTO pay(CreatePaymentRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment request is required");
        }

        Payment payment = paymentGateway.createPayment(request.bookingId(), request.paymentDetails());
        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.PAID);
        bookingRepository.save(booking);
        return PaymentDTO.from(payment);
    }

    public PaymentDTO getReceipt(Long id) {
        return PaymentDTO.from(paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found")));
    }

    public PaymentDTO getByBookingId(Long bookingId) {
        if (bookingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking id is required");
        }

        return PaymentDTO.from(paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found")));
    }

    public PaymentDTO getByTransactionId(String transactionId) {
        if (transactionId == null || transactionId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction id is required");
        }

        return PaymentDTO.from(paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found")));
    }
}
