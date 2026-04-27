package org.study.taxi;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.study.taxi.entity.Car;
import org.study.taxi.entity.User;
import org.study.taxi.repository.CarRepository;
import org.study.taxi.repository.UserRepository;
import org.study.taxi.security.SecurityConfig;
import org.study.taxi.type.CarClass;
import org.study.taxi.type.UserRole;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.count() > 0) return;

        User user = new User();
        user.setName("J Doe");
        user.setEmail("john@example.com");
        user.setPassword(passwordEncoder.encode("123456"));
        user.setRole(UserRole.CUSTOMER);
        userRepository.save(user);

        Car car = new Car();
        car.setModel("test-model-A");
        car.setAvailable(true);
        car.setSeats(4);
        car.setPrice(1);
        car.setRegistrationNumber("test-num-1");
        car.setServiceTier(CarClass.COMFORT);
        carRepository.save(car);
    }
}
