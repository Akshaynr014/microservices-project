package com.micro.payment_service.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String transactionId;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    private String remarks;

    // ✅ ADD THESE - For storing fetched data (not in database)
    @Transient
    @JsonIgnoreProperties(ignoreUnknown = true)
    private Object orderDetails;

    @Transient
    @JsonIgnoreProperties(ignoreUnknown = true)
    private Object userDetails;
}