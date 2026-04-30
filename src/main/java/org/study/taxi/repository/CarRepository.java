package org.study.taxi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.study.taxi.dto.CarResponse;
import org.study.taxi.entity.Car;
import org.study.taxi.type.CarClass;

public interface CarRepository extends JpaRepository<Car, Long> {

    @Query("""
            SELECT c
            FROM Car c
            WHERE c.available = true
              AND (:model IS NULL OR LOWER(c.model) LIKE LOWER(CONCAT('%', :model, '%')))
              AND (:maxPrice IS NULL OR c.price <= :maxPrice)
              AND (:serviceTier IS NULL OR c.serviceTier = :serviceTier)
              AND (:seats IS NULL OR c.seats = :seats)
            """)
    Page<CarResponse> searchAvailableCars(
            @Param("model") String model,
            @Param("maxPrice") Double maxPrice,
            @Param("serviceTier") CarClass serviceTier,
            @Param("seats") Integer seats,
            Pageable pageable
    );
}
