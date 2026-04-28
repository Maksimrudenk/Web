package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.study.taxi.dto.UserResponse;
import org.study.taxi.dto.UserUpdateRequest;
import org.study.taxi.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id, Authentication authentication) {
        return userService.findById(id, authentication.getName());
    }

    @GetMapping
    public UserResponse getByEmail(@RequestParam String email, Authentication authentication) {
        return userService.findByEmail(email, authentication.getName());
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                                   @RequestBody UserUpdateRequest request,
                                   Authentication authentication) {
        return userService.updateUser(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id, Authentication authentication) {
        userService.deleteUser(id, authentication.getName());
    }
}
