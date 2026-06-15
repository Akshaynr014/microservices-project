package com.micro.ai_assistant_service.controller;

import com.micro.ai_assistant_service.dto.ChatRequest;
import com.micro.ai_assistant_service.dto.ChatResponse;
import com.micro.ai_assistant_service.entity.ChatMessage;
import com.micro.ai_assistant_service.entity.UserMemory;
import com.micro.ai_assistant_service.service.AiChatService;
import com.micro.ai_assistant_service.service.MemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant APIs", description = "Chat, history and memory APIs")
public class AiChatController {

    private final AiChatService aiChatService;
    private final MemoryService memoryService;

    @PostMapping("/chat")
    @Operation(summary = "Chat with AI assistant")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return aiChatService.chat(request);
    }

    @GetMapping("/history/{userId}")
    @Operation(summary = "Get chat history by user id")
    public List<ChatMessage> getHistory(@PathVariable Long userId) {
        return aiChatService.getHistory(userId);
    }

    @DeleteMapping("/history/{userId}")
    @Operation(summary = "Delete chat history by user id")
    public String deleteHistory(@PathVariable Long userId) {
        aiChatService.deleteHistory(userId);
        return "Chat history deleted successfully";
    }

    @GetMapping("/memory/{userId}")
    @Operation(summary = "Get user memory by user id")
    public List<UserMemory> getMemory(@PathVariable Long userId) {
        return memoryService.getMemory(userId);
    }

    @DeleteMapping("/memory/{userId}")
    @Operation(summary = "Delete user memory by user id")
    public String deleteMemory(@PathVariable Long userId) {
        memoryService.deleteMemory(userId);
        return "User memory deleted successfully";
    }
}