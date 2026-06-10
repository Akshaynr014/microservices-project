## 🛠️ Technologies Used

| Category | Technology |
|----------|------------|
| **Framework** | Spring Boot 3.2.5 |
| **Service Discovery** | Netflix Eureka |
| **API Gateway** | Spring Cloud Gateway |
| **Communication** | OpenFeign |
| **Database** | PostgreSQL 15 |
| **Containerization** | Docker + Docker Compose |
| **Frontend** | React + Tailwind CSS |
| **Build Tool** | Maven |
| **Java Version** | 21 |
| **API Documentation** | Swagger / OpenAPI 3.0 |
| **Testing** | JUnit 5, Mockito |
| **Coverage Report** | Jacoco |

## 📦 Services

| Service | Port | Database | Swagger UI | Description |
|---------|------|----------|------------|-------------|
| **Eureka Server** | 8761 | - | - | Service Discovery & Registration |
| **API Gateway** | 8070 | - | - | Single entry point, routing |
| **User Service** | 8089 | micro_user_db | [Swagger](http://localhost:8089/swagger-ui.html) | User CRUD operations |
| **Product Service** | 8086 | micro_product_db | [Swagger](http://localhost:8086/swagger-ui.html) | Product management |
| **Order Service** | 8090 | micro_order_db | [Swagger](http://localhost:8090/swagger-ui.html) | Order processing with Feign |
| **Payment Service** | 8087 | micro_payment_db | [Swagger](http://localhost:8087/swagger-ui.html) | Payment processing |

## 📚 API Documentation (Swagger)

Each service has interactive API documentation:

| Service | Swagger URL |
|---------|-------------|
| User Service | http://localhost:8089/swagger-ui.html |
| Product Service | http://localhost:8086/swagger-ui.html |
| Order Service | http://localhost:8090/swagger-ui.html |
| Payment Service | http://localhost:8087/swagger-ui.html |

> **Note:** Click "Try it out" button on Swagger UI to test APIs directly from your browser!

## 🧪 Unit Testing

Each service has comprehensive unit tests using **JUnit 5** and **Mockito**.

### Test Coverage

| Service | Test Class | Test Count |
|---------|------------|------------|
| **User Service** | UserServiceTest, UserControllerTest | 11 tests |
| **Product Service** | ProductServiceTest, ProductControllerTest | 14 tests |
| **Order Service** | OrderServiceTest, OrderControllerTest | 22 tests |
| **Payment Service** | PaymentServiceTest, PaymentControllerTest | 21 tests |
| **TOTAL** | - | **68 tests** |

### Run Tests

```bash
# Run tests for all services
cd user-service && mvn test
cd ../product-service && mvn test
cd ../order-service && mvn test
cd ../payment-service && mvn test

# Run tests for a specific service
cd user-service
mvn test