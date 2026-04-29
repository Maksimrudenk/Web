package org.study.taxi.service;

import org.study.taxi.dto.PaymentResult;

import java.math.BigDecimal;
import org.study.taxi.entity.Payment;

public interface PaymentGateway {

    Payment createPayment(Long bookingId, String paymentDetails);
}


