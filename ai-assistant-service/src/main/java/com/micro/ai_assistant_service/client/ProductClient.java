package com.micro.ai_assistant_service.client;

import com.micro.ai_assistant_service.dto.ProductDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductClient {

    @GetMapping("/products")
    List<ProductDto> getAllProducts();
}