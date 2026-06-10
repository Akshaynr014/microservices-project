
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

## 📦 Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **Eureka Server** | 8761 | - | Service Discovery & Registration |
| **API Gateway** | 8070 | - | Single entry point, routing |
| **User Service** | 8089 | micro_user_db | User CRUD operations |
| **Product Service** | 8086 | micro_product_db | Product management |
| **Order Service** | 8090 | micro_order_db | Order processing with Feign |
| **Payment Service** | 8087 | micro_payment_db | Payment processing |

## 🔄 Inter-Service Communication

- **Order Service → User Service**: Fetches user details for orders
- **Order Service → Product Service**: Fetches product details for orders
- **Payment Service → Order Service**: Verifies order existence

## 🚀 Running the Project

### Prerequisites
- Docker Desktop installed
- 8GB RAM minimum
- Git (optional, for cloning)

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Akshaynr014/microservices-project.git
cd microservices-project

# Start all services
docker-compose up -d

# Verify all containers are running
docker-compose ps

# View logs
docker-compose logs -f