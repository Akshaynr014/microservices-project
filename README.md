
## 🛠️ Technologies Used

| Category | Technology |
|----------|------------|
| **Framework** | Spring Boot 3.2.5 |
| **Service Discovery** | Netflix Eureka |
| **API Gateway** | Spring Cloud Gateway |
| **Communication** | OpenFeign |
| **Database** | PostgreSQL 15 |
| **Containerization** | Docker + Docker Compose |
| **Frontend** | React 18 + Tailwind CSS + Framer Motion |
| **Build Tool** | Maven |
| **Java Version** | 21 |
| **API Documentation** | Swagger / OpenAPI 3.0 |
| **Testing** | JUnit 5, Mockito |
| **Coverage Report** | Jacoco |
| **Authentication** | JWT (JSON Web Token) |
| **Payment Gateway** | Razorpay |
| **Image Upload** | Multipart File Upload |

## 📦 Services

| Service | Port | Database | Swagger UI | Description |
|---------|------|----------|------------|-------------|
| **Eureka Server** | 8761 | - | - | Service Discovery & Registration |
| **API Gateway** | 8070 | - | - | Single entry point, routing |
| **User Service** | 8089 | micro_user_db | [Swagger](http://localhost:8089/swagger-ui.html) | User CRUD + Authentication + Newsletter |
| **Product Service** | 8086 | micro_product_db | [Swagger](http://localhost:8086/swagger-ui.html) | Product management + Categories + Image Upload |
| **Order Service** | 8090 | micro_order_db | [Swagger](http://localhost:8090/swagger-ui.html) | Order processing + Cancellation + Feign |
| **Payment Service** | 8087 | micro_payment_db | [Swagger](http://localhost:8087/swagger-ui.html) | Razorpay payment processing |

## 🎯 Features Implemented

### User Features
- ✅ User Registration & Login with JWT
- ✅ Role-based Access (Admin/User)
- ✅ Browse Products with Category Filters
- ✅ Add to Cart
- ✅ Secure Checkout with Address
- ✅ Razorpay Payment Integration
- ✅ Order History & Tracking
- ✅ Order Cancellation (Pending orders)
- ✅ Product Reviews & Ratings
- ✅ Newsletter Subscription
- ✅ Order Confirmation Page

### Admin Features
- ✅ Admin Dashboard
- ✅ Add/Edit/Delete Products
- ✅ Upload Product Images
- ✅ Manage Orders (Confirm, Ship, Deliver)
- ✅ Manage Users
- ✅ View All Orders

### Technical Features
- ✅ Service Discovery with Eureka
- ✅ API Gateway with Routing
- ✅ Feign Clients for Inter-service Communication
- ✅ Database per Service Pattern
- ✅ Docker Containerization
- ✅ Docker Compose Orchestration
- ✅ JWT Authentication
- ✅ Swagger/OpenAPI Documentation
- ✅ Unit Tests (68 tests)
- ✅ Jacoco Test Coverage Reports

## 📚 API Documentation (Swagger)

Each service has interactive API documentation:

| Service | Swagger URL |
|---------|-------------|
| User Service | http://localhost:8089/swagger-ui.html |
| Product Service | http://localhost:8086/swagger-ui.html |
| Order Service | http://localhost:8090/swagger-ui.html |
| Payment Service | http://localhost:8087/swagger-ui.html |

> **Note:** Click "Try it out" button on Swagger UI to test APIs directly from your browser!

## 🔄 Inter-Service Communication

- **Order Service → User Service**: Fetches user details for orders
- **Order Service → Product Service**: Fetches product details for orders
- **Payment Service → Order Service**: Verifies order existence

## 👑 Admin Access

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@test.com | 123456 |
| **User** | user@test.com | 123456 |

> Admin has access to: Manage Products, Orders, and Users

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