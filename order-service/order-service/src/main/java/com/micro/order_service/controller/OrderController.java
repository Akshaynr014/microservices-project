package com.micro.order_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// ✅ ADD THESE IMPORT LINES
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import com.micro.order_service.model.Order;
import com.micro.order_service.service.OrderService;
import java.util.List;

@RestController
@RequestMapping("/orders")
@Tag(name = "Order Management", description = "APIs for managing orders with user and product details")  // ✅ ADD THIS LINE
public class OrderController {

    @Autowired
    private OrderService service;

    // CREATE ORDER
    @PostMapping
    @Operation(summary = "Create a new order", description = "Creates an order for a user with a product")  // ✅ ADD THIS LINE
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid order data"),
            @ApiResponse(responseCode = "404", description = "User or Product not found")
    })
    public Order create(@RequestBody Order order) {
        return service.save(order);
    }

    // GET ORDER + USER + PRODUCT (Single order with all details)
    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Returns a complete order with user and product details")  // ✅ ADD THIS LINE
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order found"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public Object getOrder(@PathVariable Long id) {
        return service.getOrderWithUserAndProduct(id);
    }

    // GET ALL ORDERS with user and product details
    @GetMapping
    @Operation(summary = "Get all orders", description = "Returns a list of all orders with user and product details")  // ✅ ADD THIS LINE
    public List<Order> getAllOrders() {
        return service.getAllOrders();
    }

    // DELETE ORDER
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete order", description = "Deletes an order by ID")  // ✅ ADD THIS LINE
    public void deleteOrder(@PathVariable Long id) {
        service.deleteOrder(id);
    }

    // UPDATE ORDER STATUS
    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Updates the status of an order (PENDING, CONFIRMED, PAID, SHIPPED, DELIVERED)")  // ✅ ADD THIS LINE
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateOrderStatus(id, status);
    }

    // GET ORDERS BY USER ID
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get orders by user ID", description = "Returns all orders for a specific user")  // ✅ ADD THIS LINE
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return service.getOrdersByUser(userId);
    }

    // GET ORDERS BY STATUS
    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status", description = "Returns all orders with a specific status")  // ✅ ADD THIS LINE
    public List<Order> getOrdersByStatus(@PathVariable String status) {
        return service.getOrdersByStatus(status);
    }

    // UPDATE ORDER (Full update)
    @PutMapping("/{id}")
    @Operation(summary = "Update order completely", description = "Updates all fields of an existing order")  // ✅ ADD THIS LINE
    public Order updateOrder(@PathVariable Long id, @RequestBody Order order) {
        return service.updateOrder(id, order);
    }
}