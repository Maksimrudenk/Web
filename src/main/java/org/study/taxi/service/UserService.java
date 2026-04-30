package org.study.taxi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.study.taxi.dto.UserResponse;
import org.study.taxi.dto.UserUpdateRequest;
import org.study.taxi.entity.User;
import org.study.taxi.repository.UserRepository;
import org.study.taxi.type.UserRole;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse findById(Long id, String actorEmail) {
        User actor = findActor(actorEmail);
        User target = findTargetById(id);

        validateAccess(actor, target);

        return UserResponse.from(target);
    }

    public UserResponse findByEmail(String email, String actorEmail) {
        User actor = findActor(actorEmail);
        User target = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateAccess(actor, target);

        return UserResponse.from(target);
    }

    public List<UserResponse> findAll(String actorEmail) {
        User actor = findActor(actorEmail);
        if (actor.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public UserResponse updateUser(Long userId, UserUpdateRequest request, String actorEmail) {
        User actor = findActor(actorEmail);
        User target = findTargetById(userId);

        validateAccess(actor, target);

        if (request.email() != null && !request.email().equals(target.getEmail())
                && userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        if (request.name() != null) {
            target.setName(request.name());
        }
        if (request.email() != null) {
            target.setEmail(request.email());
        }
        if (request.phone() != null) {
            target.setPhone(request.phone());
        }
        if (request.address() != null) {
            target.setAddress(request.address());
        }

        User saved = userRepository.save(target);
        return UserResponse.from(saved);
    }

    public void deleteUser(Long userId, String actorEmail) {
        User actor = findActor(actorEmail);
        User target = findTargetById(userId);

        validateAccess(actor, target);

        userRepository.delete(target);
    }

    private User findActor(String actorEmail) {
        return userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }

    private User findTargetById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void validateAccess(User actor, User target) {
        boolean actorIsAdmin = actor.getRole() == UserRole.ADMIN;
        boolean actorIsTarget = actor.getId().equals(target.getId());

        if (!actorIsAdmin && !actorIsTarget) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have access to this user");
        }
    }
}
