package org.study.taxi.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("HIRE")
@Getter
@Setter
@NoArgsConstructor

public class HireBooking extends Booking {

    private LocalDateTime hireEnd;
}
