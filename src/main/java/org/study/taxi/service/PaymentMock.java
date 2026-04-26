package org.study.taxi.service;

import org.springframework.stereotype.Service;
import org.study.taxi.dto.PaymentResult;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentMock implements PaymentGateway {

    @Override
    public PaymentResult charge(
            BigDecimal amount,
            String paymentDetails) {

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
