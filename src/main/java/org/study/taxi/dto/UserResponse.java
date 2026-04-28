package org.study.taxi.dto;

import org.study.taxi.entity.User;
import org.study.taxi.type.UserRole;

public record UserResponse(
        Long id,
        String name,
        String email,
        String phone,
        String address,
        UserRole role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()
        );
    }
}
