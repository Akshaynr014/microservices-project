package com.micro.payment_service.controller;

import com.micro.payment_service.model.Payment;
import com.micro.payment_service.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// ✅ ADD THESE IMPORT LINES
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.List;

@RestController
@RequestMapping("/payments")
@Tag(name = "Payment Management", description = "APIs for processing and managing payments")  // ✅ ADD THIS LINE
public class PaymentController {

    @Autowired
    private PaymentService service;

    @PostMapping
    @Operation(summary = "Process a new payment", description = "Creates a payment for an existing order")  // ✅ ADD THIS LINE
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payment data"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public Payment createPayment(@RequestBody Payment payment) {
        return service.createPayment(payment);
    }

    @GetMapping
    @Operation(summary = "Get all payments", description = "Returns a list of all payments")  // ✅ ADD THIS LINE
    public List<Payment> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID", description = "Returns a single payment")  // ✅ ADD THIS LINE
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment found"),
            @ApiResponse(responseCode = "404", description = "Payment not found")
    })
    public Payment getPaymentById(@PathVariable Long id) {
        return service.getPaymentById(id);
    }

    @GetMapping("/{id}/details")
    @Operation(summary = "Get payment with full details", description = "Returns payment along with order and user details")  // ✅ ADD THIS LINE
    public Object getPaymentWithDetails(@PathVariable Long id) {
        return service.getPaymentWithDetails(id);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment by order ID", description = "Returns payment for a specific order")  // ✅ ADD THIS LINE
    public Payment getPaymentByOrderId(@PathVariable Long orderId) {
        return service.getPaymentByOrderId(orderId);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get payments by status", description = "Returns payments filtered by status (SUCCESS, PENDING, FAILED, REFUNDED)")  // ✅ ADD THIS LINE
    public List<Payment> getPaymentsByStatus(@PathVariable String status) {
        return service.getPaymentsByStatus(status);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update payment status", description = "Updates the status of a payment")  // ✅ ADD THIS LINE
    public Payment updatePaymentStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updatePaymentStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete payment", description = "Deletes a payment record by ID")  // ✅ ADD THIS LINE
    public void deletePayment(@PathVariable Long id) {
        service.deletePayment(id);
    }
}