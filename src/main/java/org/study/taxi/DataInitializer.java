package org.study.taxi;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.study.taxi.entity.Car;
import org.study.taxi.entity.User;
import org.study.taxi.repository.CarRepository;
import org.study.taxi.repository.UserRepository;
import org.study.taxi.type.CarClass;
import org.study.taxi.type.UserRole;

import java.util.Random;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        users();
        cars();
    }

    // ================= USERS =================

    private void users() {
        if (userRepository.count() > 0) return;

        user("J Doe", "john@example.com", "Test address", "111222111",
                "123456", UserRole.CUSTOMER);

        user("Admin", "admin@example.com", "Admin address", "999999999",
                "111", UserRole.ADMIN);

        user("Alice Brown", "alice@example.com", "Nicosia Center 12",
                "700000001", "123456", UserRole.CUSTOMER);

        user("Bob Smith", "bob@example.com", "Limassol Marina 5",
                "700000002", "123456", UserRole.CUSTOMER);

        user("Charlie Green", "charlie@example.com", "Paphos Avenue 22",
                "700000003", "123456", UserRole.CUSTOMER);
    }

    private void user(String name,
                      String email,
                      String address,
                      String phone,
                      String rawPassword,
                      UserRole role) {

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setAddress(address);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);

        userRepository.save(user);
    }

    // ================= CARS =================

    private void cars() {
        if (carRepository.count() > 0) return;

        createCars(CarClass.ECONOMY, 5);
        createCars(CarClass.COMFORT, 5);
        createCars(CarClass.BUSINESS, 5);
        createCars(CarClass.PREMIUM, 5);
        createCars(CarClass.VAN, 5);
    }

    private void createCars(CarClass tier, int amount) {
        for (int i = 1; i <= amount; i++) {

            Car car = new Car();
            car.setModel(tier.name() + "-model-" + i);
            car.setAvailable(true);
            car.setSeats(resolveSeats(tier));
            car.setPrice(resolvePrice(tier));
            car.setRegistrationNumber(tier.name() + "-REG-" + i);
            car.setServiceTier(tier);

            carRepository.save(car);
        }
    }

    private int resolveSeats(CarClass tier) {
        int[] cars = {3,4,5};
        int[] vans = {6,7,8};
        Random ran = new Random();

        return switch (tier) {
            case ECONOMY, COMFORT, BUSINESS, PREMIUM -> cars[ran.nextInt(cars.length)];
            case VAN -> vans[ran.nextInt(vans.length)];
        };
    }

    private double resolvePrice(CarClass tier) {
        int[] cars = {5,6,7};
        int[] vans = {7,8};
        Random ran = new Random();

        return switch (tier) {
            case ECONOMY -> cars[ran.nextInt(cars.length)]*2;
            case COMFORT -> cars[ran.nextInt(cars.length)]*4;
            case BUSINESS -> cars[ran.nextInt(cars.length)]*5;
            case PREMIUM -> cars[ran.nextInt(cars.length)]*8;
            case VAN -> vans[ran.nextInt(vans.length)]*4;
        };
    }
}