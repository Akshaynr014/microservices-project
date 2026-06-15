package com.micro.ai_assistant_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(length = 20)
    private String role; 
    // USER or ASSISTANT

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime createdAt;
}