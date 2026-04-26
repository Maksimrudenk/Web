package org.study.taxi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.study.taxi.type.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    private BigDecimal amount;

    private String transactionId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private LocalDateTime paymentTime;
}
