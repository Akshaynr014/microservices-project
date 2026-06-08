package com.micro.order_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "USER-SERVICE")   // 🔥 matches Eureka name
public interface UserClient {

    @GetMapping("/users/{id}")
    Object getUser(@PathVariable Long id);
}