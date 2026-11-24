package com.auth.controller;

import com.auth.dto.ApiResponse;
import com.auth.dto.UserResponse;
import com.auth.exception.BadRequestException;
import com.auth.exception.ResourceNotFoundException;
import com.auth.model.AuthProvider;
import com.auth.model.Role;
import com.auth.model.User;
import com.auth.repository.UserRepository;
import com.auth.security.CurrentUser;
import com.auth.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getAdminStats() {
        List<User> users = userRepository.findAll();

        long totalUsers = users.size();
        long googleUsers = users.stream().filter(u -> u.getProvider() == AuthProvider.GOOGLE).count();
        long localUsers = users.stream().filter(u -> u.getProvider() == AuthProvider.LOCAL).count();
        long adminUsers = users.stream().filter(u -> u.getRole() == Role.ROLE_ADMIN).count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("googleUsers", googleUsers);
        stats.put("localUsers", localUsers);
        stats.put("adminUsers", adminUsers);

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @CurrentUser UserPrincipal currentUser
    ) {
        String roleStr = request.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            throw new BadRequestException("Role is required");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleStr);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Prevent self-demotion from admin
        if (user.getId().equals(currentUser.getId()) && newRole != Role.ROLE_ADMIN) {
            throw new BadRequestException("You cannot remove your own admin privileges.");
        }

        user.setRole(newRole);
        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(mapToUserResponse(updatedUser));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Prevent deleting own account
        if (user.getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot delete your own admin account.");
        }

        userRepository.delete(user);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully"));
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .imageUrl(user.getImageUrl())
                .provider(user.getProvider())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
