package com.micro.ai_assistant_service.repository;

import com.micro.ai_assistant_service.entity.UserMemory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMemoryRepository extends JpaRepository<UserMemory, Long> {

    List<UserMemory> findByUserId(Long userId);

    Optional<UserMemory> findByUserIdAndMemoryKey(Long userId, String memoryKey);

    void deleteByUserId(Long userId);
}