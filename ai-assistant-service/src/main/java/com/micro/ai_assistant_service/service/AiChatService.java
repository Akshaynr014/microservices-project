package com.micro.ai_assistant_service.service;

import com.micro.ai_assistant_service.client.ProductClient;
import com.micro.ai_assistant_service.dto.ChatRequest;
import com.micro.ai_assistant_service.dto.ChatResponse;
import com.micro.ai_assistant_service.dto.ProductDto;
import com.micro.ai_assistant_service.entity.ChatMessage;
import com.micro.ai_assistant_service.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final OllamaService ollamaService;
    private final MemoryService memoryService;
    private final ProductClient productClient;

    @Transactional
    public ChatResponse chat(ChatRequest request) {
        ChatMessage userMessage = ChatMessage.builder()
                .userId(request.getUserId())
                .role("USER")
                .message(request.getMessage())
                .createdAt(LocalDateTime.now())
                .build();

        chatMessageRepository.save(userMessage);

        String memoryText = memoryService.getMemoryAsText(request.getUserId());

        List<ChatMessage> recentChats =
                chatMessageRepository.findTop10ByUserIdOrderByCreatedAtDesc(request.getUserId());

        String productContext = "";
        if (isProductRelated(request.getMessage())) {
            productContext = getProductContext();
        }

        String prompt = buildPrompt(request, memoryText, recentChats, productContext);

        String aiReply = ollamaService.getResponse(prompt.toString());
        saveSimpleMemory(request.getUserId(), request.getMessage());

        ChatMessage assistantMessage = ChatMessage.builder()
                .userId(request.getUserId())
                .role("ASSISTANT")
                .message(aiReply)
                .createdAt(LocalDateTime.now())
                .build();

        chatMessageRepository.save(assistantMessage);

        return new ChatResponse(aiReply);
    }

    public List<ChatMessage> getHistory(Long userId) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    @Transactional
    public void deleteHistory(Long userId) {
        chatMessageRepository.deleteByUserId(userId);
    }

    private String buildPrompt(
            ChatRequest request,
            String memoryText,
            List<ChatMessage> recentChats,
            String productContext
    ) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are a friendly personal AI assistant inside an ecommerce application.

                Rules:
                1. You can answer general questions like Java, sports, technology, etc.
                2. If the user asks about products, orders, cart, payment, or shopping, answer as ecommerce assistant.
                3. Do not say "Hello Akshay" in every reply.
                4. Use the user's name only when it feels natural.
                5. Keep answers short, clear and natural.
                6. If product data is provided below, answer only using that product data.
                7. If user asks for store products and product data is empty, say product service is not available right now.

                """);

        prompt.append("Saved user memory:\n");
        prompt.append(memoryText).append("\n");

        prompt.append("Recent chat history:\n");
        for (ChatMessage chat : recentChats) {
            prompt.append(chat.getRole())
                    .append(": ")
                    .append(chat.getMessage())
                    .append("\n");
        }

        if (!productContext.isBlank()) {
            prompt.append("\nAvailable product data from store:\n");
            prompt.append(productContext).append("\n");
        }

        prompt.append("\nCurrent user message:\n");
        prompt.append(request.getMessage());

        return prompt.toString();
    }

    private boolean isProductRelated(String message) {
        String lower = message.toLowerCase();

        return lower.contains("product")
                || lower.contains("products")
                || lower.contains("electronics")
                || lower.contains("electronic")
                || lower.contains("laptop")
                || lower.contains("mobile")
                || lower.contains("phone")
                || lower.contains("price")
                || lower.contains("stock")
                || lower.contains("category")
                || lower.contains("store");
    }

    private String getProductContext() {
        try {
            List<ProductDto> products = productClient.getAllProducts();

            if (products == null || products.isEmpty()) {
                return "";
            }

            StringBuilder context = new StringBuilder();

            for (ProductDto product : products) {
                context.append("- ")
                        .append("Id: ").append(product.getId())
                        .append(", Name: ").append(product.getName())
                        .append(", Category: ").append(product.getCategory())
                        .append(", Price: Rs ").append(product.getPrice())
                        .append(", Stock: ").append(product.getStock())
                        .append(", Description: ").append(product.getDescription())
                        .append("\n");
            }

            return context.toString();

        } catch (Exception e) {
            return "";
        }
    }

    private void saveSimpleMemory(Long userId, String message) {
        String lowerMessage = message.toLowerCase();

        if (lowerMessage.contains("my name is")) {
            String name = message.substring(lowerMessage.indexOf("my name is") + 10).trim();
            saveMemoryIfNotBlank(userId, "name", name);
        }

        if (lowerMessage.contains("i live in")) {
            String city = message.substring(lowerMessage.indexOf("i live in") + 9).trim();
            saveMemoryIfNotBlank(userId, "city", city);
        }

        if (lowerMessage.contains("i like")) {
            String likes = message.substring(lowerMessage.indexOf("i like") + 6).trim();
            saveMemoryIfNotBlank(userId, "likes", likes);
        }

        if (lowerMessage.contains("my friend name is")) {
            String friendName = message.substring(lowerMessage.indexOf("my friend name is") + 17).trim();
            saveMemoryIfNotBlank(userId, "friend_name", friendName);
        }

        if (lowerMessage.contains("my goal is")) {
            String goal = message.substring(lowerMessage.indexOf("my goal is") + 10).trim();
            saveMemoryIfNotBlank(userId, "goal", goal);
        }
    }

    private void saveMemoryIfNotBlank(Long userId, String key, String value) {
        if (value != null && !value.isBlank()) {
            memoryService.saveOrUpdateMemory(userId, key, value);
        }
    }
}
