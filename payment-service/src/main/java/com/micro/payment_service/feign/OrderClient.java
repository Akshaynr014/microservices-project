package com.micro.payment_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "ORDER-SERVICE")
public interface OrderClient {

    @GetMapping("/orders/{id}")
    Object getOrder(@PathVariable("id") Long id);

    @PutMapping("/orders/{id}/status")
    Object updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}