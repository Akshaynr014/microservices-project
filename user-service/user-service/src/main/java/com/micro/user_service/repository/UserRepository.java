package com.micro.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.micro.user_service.model.User;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);  // ✅ ADD THIS
    boolean existsByEmail(String email);
}