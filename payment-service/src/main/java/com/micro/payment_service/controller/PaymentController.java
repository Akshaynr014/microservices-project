package com.micro.payment_service.controller;

import com.micro.payment_service.model.Payment;
import com.micro.payment_service.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/payments")
@Tag(name = "Payment Management", description = "APIs for processing and managing payments")
public class PaymentController {

    @Autowired
    private PaymentService service;

    @PostMapping
    @Operation(summary = "Process a new payment")
    public Payment createPayment(@RequestBody Payment payment) {
        return service.createPayment(payment);
    }

    @GetMapping
    @Operation(summary = "Get all payments")
    public List<Payment> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return service.getPaymentById(id);
    }

    @GetMapping("/{id}/details")
    public Object getPaymentWithDetails(@PathVariable Long id) {
        return service.getPaymentWithDetails(id);
    }

    @GetMapping("/order/{orderId}")
    public Payment getPaymentByOrderId(@PathVariable Long orderId) {
        return service.getPaymentByOrderId(orderId);
    }

    @GetMapping("/status/{status}")
    public List<Payment> getPaymentsByStatus(@PathVariable String status) {
        return service.getPaymentsByStatus(status);
    }

    @PutMapping("/{id}/status")
    public Payment updatePaymentStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updatePaymentStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deletePayment(@PathVariable Long id) {
        service.deletePayment(id);
    }

    /**
     * ✅ FIXED: Creates a REAL Razorpay order via Razorpay SDK.
     * The returned 'id' is a genuine Razorpay order ID (e.g. order_ABC123XYZ)
     * that Razorpay Checkout can validate.
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(
            @RequestBody Map<String, Object> request) {
        try {
            double amount  = Double.parseDouble(request.get("amount").toString());
            String orderId = request.get("orderId").toString();

            Map<String, Object> response = service.createRazorpayOrder(amount, orderId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error creating Razorpay order: " + e.getMessage());
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    /**
     * ✅ FIXED: Verifies Razorpay payment signature properly
     * using HMAC-SHA256 instead of always returning true.
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, String> request) {
        try {
            String razorpayOrderId   = request.get("razorpay_order_id");
            String razorpayPaymentId = request.get("razorpay_payment_id");
            String razorpaySignature = request.get("razorpay_signature");
            String internalOrderId  = request.get("orderId");

            boolean valid = service.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

            if (valid) {
                // Persist the payment record
                Payment payment = new Payment();
                payment.setOrderId(Long.parseLong(internalOrderId));
                payment.setAmount(Double.parseDouble(request.getOrDefault("amount", "0")));
                payment.setTransactionId(razorpayPaymentId);
                payment.setPaymentMethod("RAZORPAY");
                service.createPayment(payment);
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", valid);
            resp.put("message", valid ? "Payment verified" : "Invalid signature");
            return valid
                    ? ResponseEntity.ok(resp)
                    : ResponseEntity.status(400).body(resp);

        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }
}