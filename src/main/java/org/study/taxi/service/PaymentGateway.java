package org.study.taxi.service;

import org.study.taxi.dto.PaymentResult;

import java.math.BigDecimal;

public interface PaymentGateway {

    PaymentResult charge(
            BigDecimal amount,
            String paymentDetails
    );
}


