package org.study.taxi.dto;

import org.study.taxi.entity.Payment;
import org.study.taxi.type.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentDTO(
        Long id,
        String transactionId,
        Long bookingId,
        BigDecimal amount,
        PaymentStatus status,
        LocalDateTime paymentTime,
        String paymentDetails
) {
    public static PaymentDTO from(Payment payment) {
        return new PaymentDTO(
                payment.getId(),
                payment.getTransactionId(),
                payment.getBooking().getId(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getPaymentTime(),
                payment.getPaymentDetails()
        );
    }
}
