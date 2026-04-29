package org.study.taxi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.entity.User;
import org.study.taxi.repository.UserRepository;
import org.study.taxi.type.UserRole;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
public class IndexController {

    private final UserRepository userRepository;

    @GetMapping(value = "/index.html", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> index(Authentication authentication) throws IOException {
        User actor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));

        if (actor.getRole() == UserRole.ADMIN) {
            return htmlResponse(new ClassPathResource("static/admin.html"));
        }

        if (actor.getRole() == UserRole.CUSTOMER) {
            return htmlResponse(new ClassPathResource("static/index.html"));
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    private ResponseEntity<Resource> htmlResponse(Resource resource) throws IOException {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .contentLength(resource.contentLength())
                .body(resource);
    }
}
