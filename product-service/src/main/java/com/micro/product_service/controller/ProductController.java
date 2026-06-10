package com.micro.product_service.controller;

import com.micro.product_service.model.Product;
import com.micro.product_service.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// ✅ ADD THESE IMPORT LINES
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Product Management", description = "APIs for managing products")  // ✅ ADD THIS LINE
public class ProductController {

    @Autowired
    private ProductService service;

    @PostMapping
    @Operation(summary = "Create a new product", description = "Creates a product with name, description, price, and stock")  // ✅ ADD THIS LINE
    public Product createProduct(@RequestBody Product product) {
        return service.createProduct(product);
    }

    @GetMapping
    @Operation(summary = "Get all products", description = "Returns a list of all products")  // ✅ ADD THIS LINE
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Returns a single product")  // ✅ ADD THIS LINE
    @ApiResponses(value = {  // ✅ ADD THESE LINES
            @ApiResponse(responseCode = "200", description = "Product found"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public Product getProductById(@PathVariable Long id) {
        return service.getProductById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Updates an existing product")  // ✅ ADD THIS LINE
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product", description = "Deletes a product by ID")  // ✅ ADD THIS LINE
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }
}