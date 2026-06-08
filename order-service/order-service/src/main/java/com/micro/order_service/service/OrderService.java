package com.micro.order_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.micro.order_service.feign.UserClient;
import com.micro.order_service.feign.ProductClient;
import com.micro.order_service.model.Order;
import com.micro.order_service.repository.OrderRepository;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repo;

    @Autowired
    private UserClient userClient;

    @Autowired
    private ProductClient productClient;

    // SAVE ORDER with VALIDATION
    public Order save(Order order) {
        // ✅ Validate product exists
        try {
            Object product = productClient.getProduct(order.getProductId());
            if (product == null) {
                throw new RuntimeException("Product not found with id: " + order.getProductId());
            }
        } catch (Exception e) {
            throw new RuntimeException("Product not found with id: " + order.getProductId() +
                    ". Please create the product first.");
        }

        // ✅ Validate user exists
        try {
            Object user = userClient.getUser(order.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found with id: " + order.getUserId());
            }
        } catch (Exception e) {
            throw new RuntimeException("User not found with id: " + order.getUserId() +
                    ". Please create the user first.");
        }

        // Set default status if not provided
        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }

        return repo.save(order);
    }

    // GET ORDER + USER + PRODUCT
    public Object getOrderWithUserAndProduct(Long orderId) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        final Object[] user = {null};
        final Object[] product = {null};

        // Fetch user details
        try {
            user[0] = userClient.getUser(order.getUserId());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User service unavailable");
            user[0] = error;
        }

        // Fetch product details
        if (order.getProductId() != null) {
            try {
                product[0] = productClient.getProduct(order.getProductId());
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Product service unavailable");
                product[0] = error;
            }
        }

        final Object finalUser = user[0];
        final Object finalProduct = product[0];

        return new Object() {
            public final Long id = order.getId();
            public final Long productId = order.getProductId();
            public final Long userId = order.getUserId();
            public final Object userDetails = finalUser;
            public final Object productDetails = finalProduct;
            public final String status = order.getStatus();
            public final Double totalAmount = order.getTotalAmount();
        };
    }

    // Keep old method for backward compatibility
    public Object getOrderWithUser(Long orderId) {
        return getOrderWithUserAndProduct(orderId);
    }

    // GET ALL ORDERS with details
    public List<Order> getAllOrders() {
        List<Order> orders = repo.findAll();

        for (Order order : orders) {
            try {
                Object user = userClient.getUser(order.getUserId());
                order.setUserDetails(user);
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User service unavailable");
                order.setUserDetails(error);
            }

            if (order.getProductId() != null) {
                try {
                    Object product = productClient.getProduct(order.getProductId());
                    order.setProductDetails(product);
                } catch (Exception e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Product service unavailable");
                    order.setProductDetails(error);
                }
            }
        }
        return orders;
    }

    // DELETE ORDER
    public void deleteOrder(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Order not found with id: " + id);
        }
        repo.deleteById(id);
    }

    // UPDATE ORDER STATUS
    public Order updateOrderStatus(Long id, String status) {
        Order order = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        order.setStatus(status);
        return repo.save(order);
    }

    // GET ORDERS BY USER
    public List<Order> getOrdersByUser(Long userId) {
        List<Order> orders = repo.findByUserId(userId);

        for (Order order : orders) {
            if (order.getProductId() != null) {
                try {
                    Object product = productClient.getProduct(order.getProductId());
                    order.setProductDetails(product);
                } catch (Exception e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Product service unavailable");
                    order.setProductDetails(error);
                }
            }
        }
        return orders;
    }

    // GET ORDERS BY STATUS
    public List<Order> getOrdersByStatus(String status) {
        return repo.findByStatus(status);
    }

    // UPDATE ORDER (Full update)
    public Order updateOrder(Long id, Order orderDetails) {
        Order order = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        order.setProductId(orderDetails.getProductId());
        order.setUserId(orderDetails.getUserId());
        order.setStatus(orderDetails.getStatus());
        order.setTotalAmount(orderDetails.getTotalAmount());

        return repo.save(order);
    }
}