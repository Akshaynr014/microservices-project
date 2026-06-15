## 🛠️ Technologies Used

| Category              | Technology                              |
| --------------------- | --------------------------------------- |
| **Framework**         | Spring Boot 3.2.5                       |
| **Service Discovery** | Netflix Eureka                          |
| **API Gateway**       | Spring Cloud Gateway                    |
| **Communication**     | OpenFeign                               |
| **Database**          | PostgreSQL 15                           |
| **Containerization**  | Docker + Docker Compose                 |
| **Frontend**          | React 18 + Tailwind CSS + Framer Motion |
| **Build Tool**        | Maven                                   |
| **Java Version**      | 21                                      |
| **API Documentation** | Swagger / OpenAPI 3.0                   |
| **Testing**           | JUnit 5, Mockito                        |
| **Coverage Report**   | Jacoco                                  |
| **Authentication**    | JWT (JSON Web Token)                    |
| **Payment Gateway**   | Razorpay                                |
| **Image Upload**      | Multipart File Upload                   |
| **AI Integration**    | Ollama (Llama 3.2 Local AI)             |
| **AI Memory**         | Persistent Chat History + User Memory   |

---

## 📦 Services

| Service                  | Port | Database         | Description                                       |
| ------------------------ | ---- | ---------------- | ------------------------------------------------- |
| **Eureka Server**        | 8761 | -                | Service Discovery & Registration                  |
| **API Gateway**          | 8070 | -                | Single Entry Point & Routing                      |
| **User Service**         | 8089 | micro_user_db    | User Management & Authentication                  |
| **Product Service**      | 8086 | micro_product_db | Product Catalog & Image Upload                    |
| **Order Service**        | 8090 | micro_order_db   | Order Processing & Tracking                       |
| **Payment Service**      | 8087 | micro_payment_db | Razorpay Payment Processing                       |
| **AI Assistant Service** | 8091 | micro_ai_db      | AI Chat Assistant with Memory & Product Knowledge |

---

# 🎯 Features Implemented

## 👤 User Features

* ✅ User Registration & Login with JWT
* ✅ Role-based Authorization (Admin/User)
* ✅ Browse Products with Category Filtering
* ✅ Add Products to Cart
* ✅ Secure Checkout Process
* ✅ Razorpay Payment Integration
* ✅ Order Tracking
* ✅ Order History
* ✅ Order Cancellation
* ✅ Product Reviews & Ratings
* ✅ Newsletter Subscription
* ✅ Order Confirmation Page

---

## 👨‍💼 Admin Features

* ✅ Admin Dashboard
* ✅ Product Management (Add / Update / Delete)
* ✅ Product Image Upload
* ✅ User Management
* ✅ Order Management
* ✅ Shipping & Delivery Updates

---

## 🤖 AI Assistant Features

* ✅ Local AI using Ollama
* ✅ Llama 3.2 Integration
* ✅ AI Chat Interface in React
* ✅ Persistent Chat History
* ✅ User Memory Storage
* ✅ Product Recommendation Support
* ✅ Ecommerce Shopping Assistant
* ✅ No External API Cost
* ✅ Fully Offline AI Capability

---

## ⚙️ Technical Features

* ✅ Microservices Architecture
* ✅ Service Discovery with Eureka
* ✅ API Gateway Routing
* ✅ OpenFeign Communication
* ✅ Database Per Service Pattern
* ✅ Docker Containerization
* ✅ Docker Compose Orchestration
* ✅ JWT Authentication
* ✅ Swagger Documentation
* ✅ Global Exception Handling
* ✅ Unit Testing with JUnit 5 & Mockito
* ✅ Jacoco Coverage Reports

---

# 🔄 Inter-Service Communication

* **Order Service → User Service**

    * Fetch User Details

* **Order Service → Product Service**

    * Fetch Product Information

* **Payment Service → Order Service**

    * Verify Order Information

* **AI Assistant Service → Product Service**

    * Product Knowledge & Recommendations

---

# 🤖 AI Assistant Architecture

```text
React Chat UI
      │
      ▼
API Gateway (8070)
      │
      ▼
AI Assistant Service (8091)
      │
      ├── PostgreSQL (Chat History)
      │
      ├── PostgreSQL (User Memory)
      │
      └── Ollama + Llama 3.2
```

---

# 🧪 Testing

## Test Coverage

| Service         | Tests |
| --------------- | ----- |
| User Service    | 11    |
| Product Service | 14    |
| Order Service   | 22    |
| Payment Service | 21    |
| Total           | 68    |

---

## Run Tests

```bash
cd user-service
mvn test

cd ../product-service
mvn test

cd ../order-service
mvn test

cd ../payment-service
mvn test
```

---

# 🚀 Future Enhancements

* Redis Caching
* Prometheus & Grafana Monitoring
* Zipkin Distributed Tracing
* Circuit Breaker (Resilience4j)
* Kubernetes Deployment
* AI Order Tracking Assistant
* AI Personalized Product Recommendations
* AI Voice Assistant
* Vector Database & RAG Integration
* Advanced Recommendation Engine

---

# 👨‍💻 Developed By

**Akshay N R**

Java Full Stack Developer | Spring Boot | Microservices | React | PostgreSQL | Docker | AI Integration
