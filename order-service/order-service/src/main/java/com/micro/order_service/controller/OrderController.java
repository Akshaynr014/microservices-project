package com.micro.order_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.micro.order_service.model.Order;
import com.micro.order_service.service.OrderService;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService service;

    // CREATE ORDER
    @PostMapping
    public Order create(@RequestBody Order order) {
        return service.save(order);
    }

    // GET ORDER + USER + PRODUCT (Single order with all details)
    @GetMapping("/{id}")
    public Object getOrder(@PathVariable Long id) {
        return service.getOrderWithUserAndProduct(id);  // ✅ Updated to include product
    }

    // GET ALL ORDERS with user and product details
    @GetMapping
    public List<Order> getAllOrders() {
        return service.getAllOrders();
    }

    // DELETE ORDER
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        service.deleteOrder(id);
    }

    // ✅ ADD THIS - UPDATE ORDER STATUS
    @PutMapping("/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateOrderStatus(id, status);
    }

    // ✅ ADD THIS - GET ORDERS BY USER ID
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return service.getOrdersByUser(userId);
    }

    // ✅ ADD THIS - GET ORDERS BY STATUS
    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable String status) {
        return service.getOrdersByStatus(status);
    }

    // ✅ ADD THIS - UPDATE ORDER (Full update)
    @PutMapping("/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestBody Order order) {
        return service.updateOrder(id, order);
    }
}