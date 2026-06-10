package com.micro.order_service.controller;

import com.micro.order_service.model.Order;
import com.micro.order_service.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    private MockMvc mockMvc;
    private Order testOrder;
    private Object testOrderWithDetails;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(orderController).build();
        
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setProductId(1L);
        testOrder.setUserId(1L);
        testOrder.setStatus("PENDING");
        testOrder.setTotalAmount(999.99);

        testOrderWithDetails = new Object() {
            public final Long id = 1L;
            public final Long productId = 1L;
            public final Long userId = 1L;
            public final String status = "PENDING";
            public final Double totalAmount = 999.99;
        };
    }

    // ========== CREATE ORDER TESTS ==========

    @Test
    void createOrder_ShouldReturnCreatedOrder() throws Exception {
        when(orderService.save(any(Order.class))).thenReturn(testOrder);

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":1,\"userId\":1,\"totalAmount\":999.99}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value(999.99));
        
        verify(orderService, times(1)).save(any(Order.class));
    }

    // ========== GET ORDER BY ID TESTS ==========

    @Test
    void getOrder_WhenOrderExists_ShouldReturnOrderWithDetails() throws Exception {
        when(orderService.getOrderWithUserAndProduct(1L)).thenReturn(testOrderWithDetails);

        mockMvc.perform(get("/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.userId").value(1));
        
        verify(orderService, times(1)).getOrderWithUserAndProduct(1L);
    }

    // ========== GET ALL ORDERS TESTS ==========

    @Test
    void getAllOrders_ShouldReturnListOfOrders() throws Exception {
        List<Order> orders = Arrays.asList(testOrder);
        when(orderService.getAllOrders()).thenReturn(orders);

        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1));
        
        verify(orderService, times(1)).getAllOrders();
    }

    @Test
    void getAllOrders_WhenNoOrders_ShouldReturnEmptyList() throws Exception {
        when(orderService.getAllOrders()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        
        verify(orderService, times(1)).getAllOrders();
    }

    // ========== DELETE ORDER TESTS ==========

    @Test
    void deleteOrder_ShouldDeleteOrder() throws Exception {
        doNothing().when(orderService).deleteOrder(1L);

        mockMvc.perform(delete("/orders/1"))
                .andExpect(status().isOk());
        
        verify(orderService, times(1)).deleteOrder(1L);
    }

    // ========== UPDATE ORDER STATUS TESTS ==========

    @Test
    void updateOrderStatus_ShouldReturnUpdatedOrder() throws Exception {
        when(orderService.updateOrderStatus(eq(1L), eq("CONFIRMED"))).thenReturn(testOrder);

        mockMvc.perform(put("/orders/1/status")
                .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
        
        verify(orderService, times(1)).updateOrderStatus(eq(1L), eq("CONFIRMED"));
    }

    // ========== GET ORDERS BY USER TESTS ==========

    @Test
    void getOrdersByUser_ShouldReturnOrdersForUser() throws Exception {
        List<Order> orders = Arrays.asList(testOrder);
        when(orderService.getOrdersByUser(1L)).thenReturn(orders);

        mockMvc.perform(get("/orders/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        
        verify(orderService, times(1)).getOrdersByUser(1L);
    }

    // ========== GET ORDERS BY STATUS TESTS ==========

    @Test
    void getOrdersByStatus_ShouldReturnFilteredOrders() throws Exception {
        List<Order> orders = Arrays.asList(testOrder);
        when(orderService.getOrdersByStatus("PENDING")).thenReturn(orders);

        mockMvc.perform(get("/orders/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        
        verify(orderService, times(1)).getOrdersByStatus("PENDING");
    }

    // ========== UPDATE ORDER (FULL UPDATE) TESTS ==========

    @Test
    void updateOrder_ShouldReturnUpdatedOrder() throws Exception {
        when(orderService.updateOrder(eq(1L), any(Order.class))).thenReturn(testOrder);

        mockMvc.perform(put("/orders/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":2,\"userId\":2,\"status\":\"DELIVERED\",\"totalAmount\":1999.99}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
        
        verify(orderService, times(1)).updateOrder(eq(1L), any(Order.class));
    }
}