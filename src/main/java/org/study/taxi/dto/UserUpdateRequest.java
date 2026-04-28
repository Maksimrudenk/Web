package org.study.taxi.dto;

public record UserUpdateRequest(
        String name,
        String email,
        String phone,
        String address
) {
}
