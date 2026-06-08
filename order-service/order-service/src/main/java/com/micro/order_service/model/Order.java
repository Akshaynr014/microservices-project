package com.micro.order_service.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;  // ✅ CHANGE from String product to Long productId

    private Long userId;

    private String status;  // ✅ ADD THIS - PENDING, CONFIRMED, SHIPPED, DELIVERED

    private Double totalAmount;  // ✅ ADD THIS

    @Transient
    @JsonIgnoreProperties(ignoreUnknown = true)
    private Object userDetails;

    @Transient
    @JsonIgnoreProperties(ignoreUnknown = true)
    private Object productDetails;  // ✅ ADD THIS
}