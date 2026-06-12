package com.micro.user_service.controller;

import com.micro.user_service.model.Subscriber;
import com.micro.user_service.repository.SubscriberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/newsletter")
public class NewsletterController {

    @Autowired
    private SubscriberRepository subscriberRepository;

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, String> response = new HashMap<>();
        
        if (email == null || email.isEmpty()) {
            response.put("error", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (subscriberRepository.existsByEmail(email)) {
            response.put("error", "Email already subscribed");
            return ResponseEntity.badRequest().body(response);
        }
        
        Subscriber subscriber = new Subscriber();
        subscriber.setEmail(email);
        subscriber.setSubscribedAt(LocalDateTime.now());
        subscriber.setActive(true);
        
        subscriberRepository.save(subscriber);
        
        response.put("message", "Successfully subscribed to newsletter!");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, String> response = new HashMap<>();
        
        Optional<Subscriber> subscriber = subscriberRepository.findByEmail(email);
        if (subscriber.isPresent()) {
            Subscriber sub = subscriber.get();
            sub.setActive(false);
            subscriberRepository.save(sub);
            response.put("message", "Successfully unsubscribed");
        } else {
            response.put("error", "Email not found");
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
}