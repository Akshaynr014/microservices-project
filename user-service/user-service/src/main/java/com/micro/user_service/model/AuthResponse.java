package com.micro.user_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private Long userId;
    private String role;  // ✅ ADD THIS FIELD
}