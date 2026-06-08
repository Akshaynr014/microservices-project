package com.micro.order_service.repository;

import com.micro.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);     // ✅ ADD THIS
    List<Order> findByStatus(String status);   // ✅ ADD THIS
}