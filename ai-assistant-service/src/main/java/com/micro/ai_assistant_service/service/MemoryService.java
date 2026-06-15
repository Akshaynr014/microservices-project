package com.micro.ai_assistant_service.service;

import com.micro.ai_assistant_service.entity.UserMemory;
import com.micro.ai_assistant_service.repository.UserMemoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final UserMemoryRepository userMemoryRepository;

    public void saveOrUpdateMemory(Long userId, String key, String value) {

        UserMemory memory = userMemoryRepository
                .findByUserIdAndMemoryKey(userId, key)
                .orElse(
                        UserMemory.builder()
                                .userId(userId)
                                .memoryKey(key)
                                .createdAt(LocalDateTime.now())
                                .build()
                );

        memory.setMemoryValue(value);
        memory.setUpdatedAt(LocalDateTime.now());

        userMemoryRepository.save(memory);
    }

    public String getMemoryAsText(Long userId) {

        List<UserMemory> memories = userMemoryRepository.findByUserId(userId);

        if (memories.isEmpty()) {
            return "No saved memory.";
        }

        StringBuilder memoryText = new StringBuilder();

        for (UserMemory memory : memories) {
            memoryText.append("- ")
                    .append(memory.getMemoryKey())
                    .append(": ")
                    .append(memory.getMemoryValue())
                    .append("\n");
        }

        return memoryText.toString();
    }

    public List<UserMemory> getMemory(Long userId) {
        return userMemoryRepository.findByUserId(userId);
    }

    public Optional<String> getMemoryValue(Long userId, String key) {
        return userMemoryRepository.findByUserIdAndMemoryKey(userId, key)
                .map(UserMemory::getMemoryValue);
    }

    public void deleteMemory(Long userId) {
        userMemoryRepository.deleteByUserId(userId);
    }
}
