//package com.micro.ai_assistant_service.service;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.MediaType;
//import org.springframework.stereotype.Service;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class GeminiService {
//
//    private final WebClient.Builder webClientBuilder;
//
//    @Value("${gemini.api.key}")
//    private String apiKey;
//
//    @Value("${gemini.api.url}")
//    private String apiUrl;
//
//    public String getResponse(String message) {
//
//        Map<String, Object> requestBody = Map.of(
//                "contents",
//                new Object[]{
//                        Map.of(
//                                "parts",
//                                new Object[]{
//                                        Map.of("text", message)
//                                }
//                        )
//                }
//        );
//
//        try {
//
//            Map response = webClientBuilder.build()
//                    .post()
//                    .uri(apiUrl + "?key=" + apiKey)
//                    .contentType(MediaType.APPLICATION_JSON)
//                    .bodyValue(requestBody)
//                    .retrieve()
//                    .bodyToMono(Map.class)
//                    .block();
//
//            return extractText(response);
//
//        } catch (Exception e) {
//            System.out.println("Gemini API Error: " + e.getMessage());
//            return "AI quota limit reached for now. Please try again later.";
//        }
//    }
//
//    private String extractText(Map response) {
//
//        try {
//            var candidates = (java.util.List<?>) response.get("candidates");
//            var candidate = (Map<?, ?>) candidates.get(0);
//
//            var content = (Map<?, ?>) candidate.get("content");
//
//            var parts = (java.util.List<?>) content.get("parts");
//
//            var part = (Map<?, ?>) parts.get(0);
//
//            return part.get("text").toString();
//
//        } catch (Exception e) {
//            return "Unable to parse Gemini response";
//        }
//    }
//}
