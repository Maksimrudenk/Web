package org.study.taxi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.study.taxi.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
