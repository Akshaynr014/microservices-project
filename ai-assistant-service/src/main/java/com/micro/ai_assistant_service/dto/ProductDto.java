package com.micro.ai_assistant_service.dto;

import lombok.Data;

@Data
public class ProductDto {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String category;
    private String imageUrl;
}