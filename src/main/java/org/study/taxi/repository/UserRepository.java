package org.study.taxi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.study.taxi.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
