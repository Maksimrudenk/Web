package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.dto.AuthResponse;
import org.study.taxi.dto.RegisterRequest;
import org.study.taxi.entity.User;
import org.study.taxi.repository.UserRepository;
import org.study.taxi.type.UserRole;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void refreshAuthenticationIfNeeded(Authentication authentication, String updatedEmail) {
        if (authentication == null || updatedEmail == null || updatedEmail.equals(authentication.getName())) {
            return;
        }

        Object principal = authentication.getPrincipal();
        Object credentials = authentication.getCredentials();

        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            principal = org.springframework.security.core.userdetails.User.withUsername(updatedEmail)
                    .password(userDetails.getPassword())
                    .authorities(userDetails.getAuthorities())
                    .build();
        }

        UsernamePasswordAuthenticationToken refreshedAuth = new UsernamePasswordAuthenticationToken(
                principal,
                credentials,
                authentication.getAuthorities()
        );
        refreshedAuth.setDetails(authentication.getDetails());
        SecurityContextHolder.getContext().setAuthentication(refreshedAuth);
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already registered"
            );
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .address(request.address())
                .role(UserRole.CUSTOMER)
                .build();

        User saved = userRepository.save(user);

        return new AuthResponse("Registration successful", saved.getEmail());
    }

}
