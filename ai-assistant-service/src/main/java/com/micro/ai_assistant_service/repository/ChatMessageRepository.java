package com.micro.ai_assistant_service.repository;

import com.micro.ai_assistant_service.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

    void deleteByUserId(Long userId);
}