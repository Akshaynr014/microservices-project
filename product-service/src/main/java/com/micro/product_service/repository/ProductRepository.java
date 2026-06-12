package com.micro.product_service.repository;

import com.micro.product_service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // ✅ ADD THIS METHOD - Find products by category
    List<Product> findByCategory(String category);
}