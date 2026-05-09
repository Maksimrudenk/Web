package org.study.taxi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.study.taxi.entity.Payment;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByBookingId(Long bookingId);

}
