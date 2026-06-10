package com.micro.payment_service.service;

import com.micro.payment_service.feign.OrderClient;
import com.micro.payment_service.feign.UserClient;
import com.micro.payment_service.model.Payment;
import com.micro.payment_service.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderClient orderClient;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private PaymentService paymentService;

    private Payment testPayment;
    private Object mockOrder;

    @BeforeEach
    void setUp() {
        testPayment = new Payment();
        testPayment.setId(1L);
        testPayment.setOrderId(1L);
        testPayment.setAmount(999.99);
        testPayment.setPaymentMethod("CARD");
        testPayment.setStatus("PENDING");
        testPayment.setRemarks("Test payment");
        testPayment.setPaymentDate(LocalDateTime.now());

        mockOrder = new Object() {
            public final Long id = 1L;
            public final Long userId = 1L;
            public final Double totalAmount = 999.99;
            public final String status = "PENDING";
        };
    }

    // ========== CREATE PAYMENT TESTS ==========

    @Test
    void createPayment_WhenOrderExists_ShouldCreateSuccessPayment() {
        // Arrange
        when(orderClient.getOrder(1L)).thenReturn(mockOrder);
        when(orderClient.updateOrderStatus(eq(1L), eq("PAID"))).thenReturn(null);
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        // Act
        Payment result = paymentService.createPayment(testPayment);

        // Assert
        assertNotNull(result);
        assertEquals("SUCCESS", result.getStatus());
        assertNotNull(result.getTransactionId());
        verify(orderClient, times(1)).getOrder(1L);
        verify(orderClient, times(1)).updateOrderStatus(1L, "PAID");
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void createPayment_WhenOrderNotFound_ShouldThrowException() {
        // Arrange
        when(orderClient.getOrder(99L)).thenThrow(new RuntimeException("Order not found"));

        Payment payment = new Payment();
        payment.setOrderId(99L);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.createPayment(payment);
        });
        assertTrue(exception.getMessage().contains("Order not found"));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    // ========== GET ALL PAYMENTS TESTS ==========

    @Test
    void getAllPayments_ShouldReturnListOfPayments() {
        // Arrange
        List<Payment> payments = Arrays.asList(testPayment);
        when(paymentRepository.findAll()).thenReturn(payments);
        when(orderClient.getOrder(1L)).thenReturn(mockOrder);
        when(userClient.getUser(any(Long.class))).thenReturn(new Object());

        // Act
        List<Payment> result = paymentService.getAllPayments();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(paymentRepository, times(1)).findAll();
    }

    @Test
    void getAllPayments_WhenNoPayments_ShouldReturnEmptyList() {
        // Arrange
        when(paymentRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<Payment> result = paymentService.getAllPayments();

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(paymentRepository, times(1)).findAll();
    }

    // ========== GET PAYMENT BY ID TESTS ==========

    @Test
    void getPaymentById_WhenPaymentExists_ShouldReturnPayment() {
        // Arrange
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));
        when(orderClient.getOrder(1L)).thenReturn(mockOrder);
        when(userClient.getUser(any(Long.class))).thenReturn(new Object());

        // Act
        Payment result = paymentService.getPaymentById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(999.99, result.getAmount());
        verify(paymentRepository, times(1)).findById(1L);
    }

    @Test
    void getPaymentById_WhenPaymentNotFound_ShouldThrowException() {
        // Arrange
        when(paymentRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.getPaymentById(99L);
        });
        assertEquals("Payment not found with id: 99", exception.getMessage());
    }

    // ========== GET PAYMENT BY ORDER ID TESTS ==========

    @Test
    void getPaymentByOrderId_WhenPaymentExists_ShouldReturnPayment() {
        // Arrange
        when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(testPayment));
        when(orderClient.getOrder(1L)).thenReturn(mockOrder);
        when(userClient.getUser(any(Long.class))).thenReturn(new Object());

        // Act
        Payment result = paymentService.getPaymentByOrderId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
        verify(paymentRepository, times(1)).findByOrderId(1L);
    }

    @Test
    void getPaymentByOrderId_WhenPaymentNotFound_ShouldThrowException() {
        // Arrange
        when(paymentRepository.findByOrderId(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.getPaymentByOrderId(99L);
        });
        assertEquals("Payment not found for order: 99", exception.getMessage());
    }

    // ========== UPDATE PAYMENT STATUS TESTS ==========

    @Test
    void updatePaymentStatus_WhenPaymentExists_ShouldUpdateStatus() {
        // Arrange
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        // Act
        Payment result = paymentService.updatePaymentStatus(1L, "SUCCESS");

        // Assert
        assertNotNull(result);
        verify(paymentRepository, times(1)).findById(1L);
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    // ========== GET PAYMENTS BY STATUS TESTS ==========

    @Test
    void getPaymentsByStatus_ShouldReturnFilteredPayments() {
        // Arrange
        List<Payment> payments = Arrays.asList(testPayment);
        when(paymentRepository.findByStatus("SUCCESS")).thenReturn(payments);

        // Act
        List<Payment> result = paymentService.getPaymentsByStatus("SUCCESS");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(paymentRepository, times(1)).findByStatus("SUCCESS");
    }

    // ========== DELETE PAYMENT TESTS ==========

    @Test
    void deletePayment_WhenPaymentExists_ShouldDelete() {
        // Arrange
        when(paymentRepository.existsById(1L)).thenReturn(true);
        doNothing().when(paymentRepository).deleteById(1L);

        // Act
        paymentService.deletePayment(1L);

        // Assert
        verify(paymentRepository, times(1)).existsById(1L);
        verify(paymentRepository, times(1)).deleteById(1L);
    }

    @Test
    void deletePayment_WhenPaymentNotFound_ShouldThrowException() {
        // Arrange
        when(paymentRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.deletePayment(99L);
        });
        assertEquals("Payment not found with id: 99", exception.getMessage());
        verify(paymentRepository, never()).deleteById(any());
    }

    // ========== GET PAYMENT WITH DETAILS TESTS ==========

    @Test
    void getPaymentWithDetails_WhenPaymentExists_ShouldReturnDetails() {
        // Arrange
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));
        when(orderClient.getOrder(1L)).thenReturn(mockOrder);
        when(userClient.getUser(any(Long.class))).thenReturn(new Object());

        // Act
        Object result = paymentService.getPaymentWithDetails(1L);

        // Assert
        assertNotNull(result);
        verify(paymentRepository, times(1)).findById(1L);
        verify(orderClient, times(2)).getOrder(1L);
    }
}