package org.study.taxi.dto;

public record CreatePaymentRequest(
        Long bookingId,
        String paymentDetails
) {
}
