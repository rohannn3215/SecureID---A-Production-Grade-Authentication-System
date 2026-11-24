package com.auth.dto;

import com.auth.model.AuthProvider;
import com.auth.model.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String imageUrl;
    private AuthProvider provider;
    private Role role;
    private java.time.LocalDateTime createdAt;
}
