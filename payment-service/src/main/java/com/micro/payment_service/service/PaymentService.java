package com.micro.payment_service.service;

import com.micro.payment_service.feign.OrderClient;
import com.micro.payment_service.feign.UserClient;
import com.micro.payment_service.model.Payment;
import com.micro.payment_service.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository repository;

    @Autowired
    private OrderClient orderClient;

    @Autowired
    private UserClient userClient;

    public Payment createPayment(Payment payment) {
        // Verify order exists before payment
        try {
            Object order = orderClient.getOrder(payment.getOrderId());
            payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            payment.setPaymentDate(LocalDateTime.now());
            payment.setStatus("SUCCESS");

            // Update order status to PAID
            orderClient.updateOrderStatus(payment.getOrderId(), "PAID");

            return repository.save(payment);
        } catch (Exception e) {
            payment.setStatus("FAILED");
            payment.setTransactionId("TXN-FAILED");
            payment.setPaymentDate(LocalDateTime.now());
            throw new RuntimeException("Order not found or payment failed: " + e.getMessage());
        }
    }

    public List<Payment> getAllPayments() {
        List<Payment> payments = repository.findAll();

        // Fetch order and user details for each payment
        for (Payment payment : payments) {
            try {
                Object order = orderClient.getOrder(payment.getOrderId());
                payment.setOrderDetails(order);

                // Extract userId from order - you need to parse the order object
                // For now, using a safer approach
                payment.setUserDetails(getUserFromOrder(order));
            } catch (Exception e) {
                System.out.println("Could not fetch details for payment: " + payment.getId());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Service unavailable");
                payment.setOrderDetails(error);
                payment.setUserDetails(error);
            }
        }
        return payments;
    }

    public Payment getPaymentById(Long id) {
        Payment payment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        // Fetch order details
        try {
            Object order = orderClient.getOrder(payment.getOrderId());
            payment.setOrderDetails(order);

            // Fetch user details from order
            payment.setUserDetails(getUserFromOrder(order));
        } catch (Exception e) {
            System.out.println("Could not fetch order details");
            Map<String, String> error = new HashMap<>();
            error.put("error", "Could not fetch details");
            payment.setOrderDetails(error);
            payment.setUserDetails(error);
        }

        return payment;
    }

    public Payment getPaymentByOrderId(Long orderId) {
        Payment payment = repository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));

        try {
            Object order = orderClient.getOrder(payment.getOrderId());
            payment.setOrderDetails(order);
            payment.setUserDetails(getUserFromOrder(order));
        } catch (Exception e) {
            System.out.println("Could not fetch order details");
            Map<String, String> error = new HashMap<>();
            error.put("error", "Could not fetch details");
            payment.setOrderDetails(error);
            payment.setUserDetails(error);
        }

        return payment;
    }

    public Payment updatePaymentStatus(Long id, String status) {
        Payment payment = getPaymentById(id);
        payment.setStatus(status);
        return repository.save(payment);
    }

    public List<Payment> getPaymentsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public void deletePayment(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Payment not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // ✅ FIXED - Get payment with full details (order + user)
    public Object getPaymentWithDetails(Long id) {
        Payment payment = getPaymentById(id);

        Object order = orderClient.getOrder(payment.getOrderId());
        Object user = getUserFromOrder(order);

        // Use final variables for the anonymous class
        final Long finalId = payment.getId();
        final Long finalOrderId = payment.getOrderId();
        final Double finalAmount = payment.getAmount();
        final String finalStatus = payment.getStatus();
        final String finalTransactionId = payment.getTransactionId();
        final Object finalOrder = order;
        final Object finalUser = user;

        return new Object() {
            public final Long id = finalId;
            public final Long orderId = finalOrderId;
            public final Double amount = finalAmount;
            public final String status = finalStatus;
            public final String transactionId = finalTransactionId;
            public final Object orderDetails = finalOrder;
            public final Object userDetails = finalUser;
        };
    }

    // ✅ Helper method to extract user from order
    private Object getUserFromOrder(Object order) {
        try {
            // Try to get user details from order
            // This depends on how your order object is structured
            // You might need to parse the order response
            return userClient.getUser(1L); // For now, fetch user by ID
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User service unavailable as of now");
            return error;
        }
    }
}