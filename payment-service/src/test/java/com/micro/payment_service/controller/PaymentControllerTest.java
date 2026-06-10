package com.micro.payment_service.controller;

import com.micro.payment_service.model.Payment;
import com.micro.payment_service.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private MockMvc mockMvc;
    private Payment testPayment;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController).build();
        
        testPayment = new Payment();
        testPayment.setId(1L);
        testPayment.setOrderId(1L);
        testPayment.setAmount(999.99);
        testPayment.setPaymentMethod("CARD");
        testPayment.setStatus("SUCCESS");
        testPayment.setTransactionId("TXN-ABC123");
        testPayment.setPaymentDate(LocalDateTime.now());
        testPayment.setRemarks("Test payment");
    }

    // ========== CREATE PAYMENT TESTS ==========

    @Test
    void createPayment_ShouldReturnCreatedPayment() throws Exception {
        when(paymentService.createPayment(any(Payment.class))).thenReturn(testPayment);

        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"orderId\":1,\"amount\":999.99,\"paymentMethod\":\"CARD\",\"remarks\":\"Test payment\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderId").value(1))
                .andExpect(jsonPath("$.amount").value(999.99))
                .andExpect(jsonPath("$.paymentMethod").value("CARD"))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
        
        verify(paymentService, times(1)).createPayment(any(Payment.class));
    }

    // ========== GET ALL PAYMENTS TESTS ==========

    @Test
    void getAllPayments_ShouldReturnListOfPayments() throws Exception {
        List<Payment> payments = Arrays.asList(testPayment);
        when(paymentService.getAllPayments()).thenReturn(payments);

        mockMvc.perform(get("/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].amount").value(999.99));
        
        verify(paymentService, times(1)).getAllPayments();
    }

    @Test
    void getAllPayments_WhenNoPayments_ShouldReturnEmptyList() throws Exception {
        when(paymentService.getAllPayments()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        
        verify(paymentService, times(1)).getAllPayments();
    }

    // ========== GET PAYMENT BY ID TESTS ==========

    @Test
    void getPaymentById_WhenPaymentExists_ShouldReturnPayment() throws Exception {
        when(paymentService.getPaymentById(1L)).thenReturn(testPayment);

        mockMvc.perform(get("/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderId").value(1))
                .andExpect(jsonPath("$.amount").value(999.99));
        
        verify(paymentService, times(1)).getPaymentById(1L);
    }

    // ========== GET PAYMENT WITH DETAILS TESTS ==========

    @Test
    void getPaymentWithDetails_ShouldReturnPaymentWithDetails() throws Exception {
        Object details = new Object() {
            public final Long id = 1L;
            public final Object orderDetails = new Object();
        };
        when(paymentService.getPaymentWithDetails(1L)).thenReturn(details);

        mockMvc.perform(get("/payments/1/details"))
                .andExpect(status().isOk());
        
        verify(paymentService, times(1)).getPaymentWithDetails(1L);
    }

    // ========== GET PAYMENT BY ORDER ID TESTS ==========

    @Test
    void getPaymentByOrderId_WhenPaymentExists_ShouldReturnPayment() throws Exception {
        when(paymentService.getPaymentByOrderId(1L)).thenReturn(testPayment);

        mockMvc.perform(get("/payments/order/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1));
        
        verify(paymentService, times(1)).getPaymentByOrderId(1L);
    }

    // ========== GET PAYMENTS BY STATUS TESTS ==========

    @Test
    void getPaymentsByStatus_ShouldReturnFilteredPayments() throws Exception {
        List<Payment> payments = Arrays.asList(testPayment);
        when(paymentService.getPaymentsByStatus("SUCCESS")).thenReturn(payments);

        mockMvc.perform(get("/payments/status/SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        
        verify(paymentService, times(1)).getPaymentsByStatus("SUCCESS");
    }

    // ========== UPDATE PAYMENT STATUS TESTS ==========

    @Test
    void updatePaymentStatus_ShouldReturnUpdatedPayment() throws Exception {
        when(paymentService.updatePaymentStatus(eq(1L), eq("SUCCESS"))).thenReturn(testPayment);

        mockMvc.perform(put("/payments/1/status")
                .param("status", "SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
        
        verify(paymentService, times(1)).updatePaymentStatus(eq(1L), eq("SUCCESS"));
    }

    // ========== DELETE PAYMENT TESTS ==========

    @Test
    void deletePayment_ShouldDeletePayment() throws Exception {
        doNothing().when(paymentService).deletePayment(1L);

        mockMvc.perform(delete("/payments/1"))
                .andExpect(status().isOk());
        
        verify(paymentService, times(1)).deletePayment(1L);
    }
}