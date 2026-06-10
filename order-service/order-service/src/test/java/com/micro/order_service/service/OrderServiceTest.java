package com.micro.order_service.service;

import com.micro.order_service.feign.ProductClient;
import com.micro.order_service.feign.UserClient;
import com.micro.order_service.model.Order;
import com.micro.order_service.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    // ===== MOCKING REPOSITORY =====
    @Mock
    private OrderRepository orderRepository;

    // ===== MOCKING FEIGN CLIENTS =====
    @Mock
    private UserClient userClient;      // ✅ Feign client for User Service

    @Mock
    private ProductClient productClient;  // ✅ Feign client for Product Service

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
    private Object mockUser;
    private Object mockProduct;

    @BeforeEach
    void setUp() {
        // Create test order
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setProductId(1L);
        testOrder.setUserId(1L);
        testOrder.setStatus("PENDING");
        testOrder.setTotalAmount(999.99);

        // Create mock user (what UserClient returns)
        mockUser = new Object() {
            public final Long id = 1L;
            public final String name = "Akshay";
            public final String email = "akshay@example.com";
        };

        // Create mock product (what ProductClient returns)
        mockProduct = new Object() {
            public final Long id = 1L;
            public final String name = "Laptop";
            public final String description = "Gaming Laptop";
            public final Double price = 999.99;
            public final Integer stock = 10;
        };
    }

    // ========== SAVE (CREATE ORDER) TESTS ==========

    @Test
    void save_WhenUserAndProductExist_ShouldCreateOrder() {
        // Arrange
        when(userClient.getUser(1L)).thenReturn(mockUser);
        when(productClient.getProduct(1L)).thenReturn(mockProduct);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // Act
        Order result = orderService.save(testOrder);

        // Assert
        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        
        // Verify Feign client calls
        verify(userClient, times(1)).getUser(1L);
        verify(productClient, times(1)).getProduct(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void save_WhenProductNotFound_ShouldThrowException() {
        // Arrange
        when(productClient.getProduct(1L)).thenThrow(new RuntimeException("Product not found"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.save(testOrder);
        });
        assertTrue(exception.getMessage().contains("Product not found"));
        
        // Verify no save happened
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void save_WhenUserNotFound_ShouldThrowException() {
        // Arrange
        when(productClient.getProduct(1L)).thenReturn(mockProduct);
        when(userClient.getUser(1L)).thenThrow(new RuntimeException("User not found"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.save(testOrder);
        });
        assertTrue(exception.getMessage().contains("User not found"));
        
        // Verify no save happened
        verify(orderRepository, never()).save(any(Order.class));
    }

    // ========== GET ORDER WITH USER AND PRODUCT TESTS ==========

    @Test
    void getOrderWithUserAndProduct_WhenOrderExists_ShouldReturnCompleteOrder() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(userClient.getUser(1L)).thenReturn(mockUser);
        when(productClient.getProduct(1L)).thenReturn(mockProduct);

        // Act
        Object result = orderService.getOrderWithUserAndProduct(1L);

        // Assert
        assertNotNull(result);
        verify(orderRepository, times(1)).findById(1L);
        verify(userClient, times(1)).getUser(1L);
        verify(productClient, times(1)).getProduct(1L);
    }

    @Test
    void getOrderWithUserAndProduct_WhenOrderNotFound_ShouldThrowException() {
        // Arrange
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.getOrderWithUserAndProduct(99L);
        });
        assertEquals("Order not found with id: 99", exception.getMessage());
    }

    @Test
    void getOrderWithUserAndProduct_WhenUserServiceUnavailable_ShouldReturnError() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(userClient.getUser(1L)).thenThrow(new RuntimeException("Connection failed"));
        when(productClient.getProduct(1L)).thenReturn(mockProduct);

        // Act
        Object result = orderService.getOrderWithUserAndProduct(1L);

        // Assert
        assertNotNull(result);
        verify(userClient, times(1)).getUser(1L);
        verify(productClient, times(1)).getProduct(1L);
    }

    // ========== GET ALL ORDERS TESTS ==========

    @Test
    void getAllOrders_ShouldReturnListOfOrders() {
        // Arrange
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findAll()).thenReturn(orders);
        when(userClient.getUser(1L)).thenReturn(mockUser);
        when(productClient.getProduct(1L)).thenReturn(mockProduct);

        // Act
        List<Order> result = orderService.getAllOrders();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(orderRepository, times(1)).findAll();
        verify(userClient, times(1)).getUser(1L);
        verify(productClient, times(1)).getProduct(1L);
    }

    @Test
    void getAllOrders_WhenNoOrders_ShouldReturnEmptyList() {
        // Arrange
        when(orderRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<Order> result = orderService.getAllOrders();

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(orderRepository, times(1)).findAll();
        verify(userClient, never()).getUser(any());
    }

    // ========== DELETE ORDER TESTS ==========

    @Test
    void deleteOrder_WhenOrderExists_ShouldDelete() {
        // Arrange
        when(orderRepository.existsById(1L)).thenReturn(true);
        doNothing().when(orderRepository).deleteById(1L);

        // Act
        orderService.deleteOrder(1L);

        // Assert
        verify(orderRepository, times(1)).existsById(1L);
        verify(orderRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteOrder_WhenOrderNotFound_ShouldThrowException() {
        // Arrange
        when(orderRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.deleteOrder(99L);
        });
        assertEquals("Order not found with id: 99", exception.getMessage());
        verify(orderRepository, never()).deleteById(any());
    }

    // ========== UPDATE ORDER STATUS TESTS ==========

    @Test
    void updateOrderStatus_WhenOrderExists_ShouldUpdateStatus() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // Act
        Order result = orderService.updateOrderStatus(1L, "CONFIRMED");

        // Assert
        assertNotNull(result);
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void updateOrderStatus_WhenOrderNotFound_ShouldThrowException() {
        // Arrange
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.updateOrderStatus(99L, "CONFIRMED");
        });
        assertEquals("Order not found with id: 99", exception.getMessage());
    }

    // ========== GET ORDERS BY USER TESTS ==========

    @Test
    void getOrdersByUser_ShouldReturnOrdersForUser() {
        // Arrange
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findByUserId(1L)).thenReturn(orders);
        when(productClient.getProduct(1L)).thenReturn(mockProduct);

        // Act
        List<Order> result = orderService.getOrdersByUser(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(orderRepository, times(1)).findByUserId(1L);
        verify(productClient, times(1)).getProduct(1L);
    }

    // ========== GET ORDERS BY STATUS TESTS ==========

    @Test
    void getOrdersByStatus_ShouldReturnFilteredOrders() {
        // Arrange
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findByStatus("PENDING")).thenReturn(orders);

        // Act
        List<Order> result = orderService.getOrdersByStatus("PENDING");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(orderRepository, times(1)).findByStatus("PENDING");
    }

    // ========== UPDATE ORDER (FULL UPDATE) TESTS ==========

    @Test
    void updateOrder_WhenOrderExists_ShouldUpdate() {
        // Arrange
        Order updateDetails = new Order();
        updateDetails.setProductId(2L);
        updateDetails.setUserId(2L);
        updateDetails.setStatus("DELIVERED");
        updateDetails.setTotalAmount(1999.99);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // Act
        Order result = orderService.updateOrder(1L, updateDetails);

        // Assert
        assertNotNull(result);
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void updateOrder_WhenOrderNotFound_ShouldThrowException() {
        // Arrange
        Order updateDetails = new Order();
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.updateOrder(99L, updateDetails);
        });
        assertEquals("Order not found with id: 99", exception.getMessage());
    }
}