package org.study.taxi.dto;

public record LoginRequest(
        String email,
        String password
) {
}
