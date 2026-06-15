package com.micro.ai_assistant_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OllamaService {

    private final WebClient.Builder webClientBuilder;

    @Value("${ollama.api.url}")
    private String ollamaApiUrl;

    @Value("${ollama.model}")
    private String model;

    public String getResponse(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
        );

        try {
            Map<?, ?> response = webClientBuilder.build()
                    .post()
                    .uri(ollamaApiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || response.get("response") == null) {
                return "Local AI returned empty response.";
            }

            return response.get("response").toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Local AI is not running. Please start Ollama.";
        }
    }
}