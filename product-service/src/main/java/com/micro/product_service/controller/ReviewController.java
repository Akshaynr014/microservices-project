package com.micro.product_service.controller;

import com.micro.product_service.model.Review;
import com.micro.product_service.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    
    @Autowired
    private ReviewRepository repository;
    
    @PostMapping
    public Review addReview(@RequestBody Review review) {
        review.setCreatedAt(LocalDateTime.now());
        return repository.save(review);
    }
    
    @GetMapping("/product/{productId}")
    public List<Review> getProductReviews(@PathVariable Long productId) {
        return repository.findByProductId(productId);
    }
    
    @GetMapping("/user/{userId}")
    public List<Review> getUserReviews(@PathVariable Long userId) {
        return repository.findByUserId(userId);
    }
}