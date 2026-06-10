package com.micro.product_service.service;

import com.micro.product_service.model.Product;
import com.micro.product_service.repository.ProductRepository;
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
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Laptop");
        testProduct.setDescription("Gaming Laptop");
        testProduct.setPrice(999.99);
        testProduct.setStock(10);
    }

    // ========== CREATE PRODUCT TESTS ==========

    @Test
    void createProduct_ShouldReturnSavedProduct() {
        // Arrange
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product savedProduct = productService.createProduct(testProduct);

        // Assert
        assertNotNull(savedProduct);
        assertEquals("Laptop", savedProduct.getName());
        assertEquals(999.99, savedProduct.getPrice());
        assertEquals(10, savedProduct.getStock());
        verify(productRepository, times(1)).save(testProduct);
    }

    // ========== GET ALL PRODUCTS TESTS ==========

    @Test
    void getAllProducts_ShouldReturnListOfProducts() {
        // Arrange
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getAllProducts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Laptop", result.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void getAllProducts_WhenNoProducts_ShouldReturnEmptyList() {
        // Arrange
        when(productRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<Product> result = productService.getAllProducts();

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(productRepository, times(1)).findAll();
    }

    // ========== GET PRODUCT BY ID TESTS ==========

    @Test
    void getProductById_WhenProductExists_ShouldReturnProduct() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // Act
        Product foundProduct = productService.getProductById(1L);

        // Assert
        assertNotNull(foundProduct);
        assertEquals(1L, foundProduct.getId());
        assertEquals("Laptop", foundProduct.getName());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void getProductById_WhenProductNotFound_ShouldThrowException() {
        // Arrange
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.getProductById(99L);
        });
        assertEquals("Product not found with id: 99", exception.getMessage());
        verify(productRepository, times(1)).findById(99L);
    }

    // ========== UPDATE PRODUCT TESTS ==========

    @Test
    void updateProduct_WhenProductExists_ShouldUpdateAndReturn() {
        // Arrange
        Product updateDetails = new Product();
        updateDetails.setName("Gaming Laptop");
        updateDetails.setDescription("High Performance Gaming Laptop");
        updateDetails.setPrice(1299.99);
        updateDetails.setStock(5);

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product updatedProduct = productService.updateProduct(1L, updateDetails);

        // Assert
        assertNotNull(updatedProduct);
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    void updateProduct_WhenProductNotFound_ShouldThrowException() {
        // Arrange
        Product updateDetails = new Product();
        updateDetails.setName("Gaming Laptop");

        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(99L, updateDetails);
        });
        assertEquals("Product not found with id: 99", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    // ========== DELETE PRODUCT TESTS ==========

    @Test
    void deleteProduct_WhenProductExists_ShouldDelete() {
        // Arrange
        when(productRepository.existsById(1L)).thenReturn(true);
        doNothing().when(productRepository).deleteById(1L);

        // Act
        productService.deleteProduct(1L);

        // Assert
        verify(productRepository, times(1)).existsById(1L);
        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteProduct_WhenProductNotFound_ShouldThrowException() {
        // Arrange
        when(productRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.deleteProduct(99L);
        });
        assertEquals("Product not found with id: 99", exception.getMessage());
        verify(productRepository, never()).deleteById(any());
    }
}