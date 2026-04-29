package org.study.taxi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;


public record PaymentResult (

        boolean success,
        String transactionId,
        String message

){



}


