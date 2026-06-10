package com.micro.user_service.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// ✅ ADD THESE 3 IMPORT LINES
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import com.micro.user_service.model.User;
import com.micro.user_service.service.UserService;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "APIs for managing users")  // ✅ ADD THIS LINE
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping
    @Operation(summary = "Create a new user", description = "Creates a user with name and email")  // ✅ ADD THIS LINE
    public User create(@RequestBody User user) {
        return service.save(user);
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Returns a list of all users")  // ✅ ADD THIS LINE
    public List<User> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Returns a single user")  // ✅ ADD THIS LINE
    @ApiResponses(value = {  // ✅ ADD THESE LINES
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public User getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Updates an existing user")  // ✅ ADD THIS LINE
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return service.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Deletes a user by ID")  // ✅ ADD THIS LINE
    public void deleteById(@PathVariable Long id) {
        service.deleteById(id);
    }
}