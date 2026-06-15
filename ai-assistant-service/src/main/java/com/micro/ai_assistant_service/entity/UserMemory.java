package com.micro.ai_assistant_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_memory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMemory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false)
    private String memoryKey;

    @Column(columnDefinition = "TEXT")
    private String memoryValue;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}