package com.micro.user_service.controller;

import com.micro.user_service.model.AuthRequest;
import com.micro.user_service.model.AuthResponse;
import com.micro.user_service.model.User;
import com.micro.user_service.security.JwtUtil;
import com.micro.user_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set role based on email
        if (user.getEmail().toLowerCase().contains("admin")) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        User savedUser = userService.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId());
        return new AuthResponse(token, "User registered successfully", savedUser.getId(), savedUser.getRole());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (Exception e) {
            throw new Exception("Invalid email or password");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        User user = userService.getUserByEmail(authRequest.getEmail());
        final String token = jwtUtil.generateToken(userDetails.getUsername(), user.getId());

        return new AuthResponse(token, "Login successful", user.getId(), user.getRole());
    }
}