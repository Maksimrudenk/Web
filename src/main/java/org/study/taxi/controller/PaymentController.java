package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.study.taxi.dto.CreatePaymentRequest;
import org.study.taxi.dto.PaymentDTO;
import org.study.taxi.entity.Payment;
import org.study.taxi.service.PaymentGateway;
import org.study.taxi.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentDTO createPayment(@RequestBody CreatePaymentRequest request) {
        return paymentService.pay(request);
    }
}