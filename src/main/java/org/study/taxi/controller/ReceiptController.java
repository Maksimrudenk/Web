package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.study.taxi.dto.PaymentDTO;
import org.study.taxi.service.PaymentService;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final PaymentService paymentService;

    @GetMapping("/{id}")
    public PaymentDTO getReceipt(@PathVariable Long id) {
        return paymentService.getReceipt(id);
    }

    @GetMapping("/transactions/{transactionId}")
    public PaymentDTO getPaymentByTransactionId(@PathVariable String transactionId) {
        return paymentService.getByTransactionId(transactionId);
    }
}
