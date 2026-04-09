# 🚀 Cloud-Native Microservices Application (Node.js + Azure)

This project is a cloud-native microservices application built with Node.js and deployed on Azure. It demonstrates how to design, containerize, and deploy distributed systems using modern DevOps and cloud practices.

## 📌 Architecture Overview (Updated)

In this version, all services are exposed externally via Azure Container Apps.

```bash
Client
|
|----> API Gateway (Public)
| |
| |----> User Service (Public)
| |
| |----> Order Service (Public)
|
|----> User Service (Direct Access - Optional)
|
|----> Order Service (Direct Access - Optional)
```

- User Service → Azure PostgreSQL
- Order Service → MongoDB Atlas

## Services

### API Gateway

- Main entry point for clients
- Aggregates data from user-service and order-service
- Publicly accessible

### User Service

- Manages user data
- Connected to Azure PostgreSQL
- Publicly accessible (for testing/debugging)

### Order Service

- Manages order data
- Connected to MongoDB Atlas
- Publicly accessible (for testing/debugging)

⚠️ Important Architecture Note

Although all services are exposed externally:

👉 Best practice (production):

Only API Gateway should be public
Other services should remain internal

👉 Current setup (for learning/testing):

## All services are external for easier debugging and direct testing

🛠️ Tech Stack

- Node.js (Express)
- Docker
- Azure Container Apps
- Azure Container Registry (ACR)
- Azure PostgreSQL
- MongoDB Atlas
- Axios (service communication)

📂 Project Structure

```bash
.
├── api-gateway/
├── user-service/
├── order-service/
├── postgres-init/
├── mongo-init/
├── docker-compose.yml (optional)
└── README.md
```

## ⚙️ Environment Variables

### API Gateway

```bash
- PORT=3000
#for cloud azure
USER_SERVICE_URL=http://user-service
ORDER_SERVICE_URL=http://order-service
#on local with docker compose
USER_SERVICE_URL=http://user-service:3001
ORDER_SERVICE_URL=http://order-service:3002
```

### User Service

```bash
PORT=3001
#for cloud azure
DATABASE_URL=postgres://<username>:<password>@<server>.postgres.database.azure.com:5432/userdb?sslmode=require
#on local with docker compose
DATABASE_URL=postgres://admin123:Admin123@postgres:5432/userdb
```

### Order Service

```bash
PORT=3002
#for cloud azure
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=ordersdb
#on local with docker compose
MONGO_URI=mongodb://admin123:Admin123@mongo:27017/ordersdb
```

## 🐳 Run Locally (Docker)

```bash
docker-compose up --build
```

### 🧪 3. Test the Application

- API Gateway (Main Entry): curl http://localhost:3000/users-with-orders
- User Service: curl http://localhost:3001/users
- Order Service: curl http://localhost:3002/orders

### MongoDB and PostgreSQL Data

- The order-service and user-service will automatically seed data if the collection and table is empty.

### Stop the Application

```bash
docker-compose down
```

## ☁️ Deploy to Azure (Updated)

### 1. Deploy User Service (External)

```bashaz
containerapp create \
 --name user-service \
 --resource-group microservices-rg \
 --environment my-env \
 --image <registry>.azurecr.io/user-service:v1 \
 --target-port 3001 \
 --ingress external \
 --env-vars DATABASE_URL="<your_postgres_url>"
```

### 2. Deploy Order Service (External)

```bash
az containerapp create \
 --name order-service \
 --resource-group microservices-rg \
 --environment my-env \
 --image <registry>.azurecr.io/order-service:v1 \
 --target-port 3002 \
 --ingress external \
 --env-vars MONGO_URI="<your_mongo_uri>"
```

### 3. Deploy API Gateway (External)

```bash
az containerapp create \
 --name api-gateway \
 --resource-group microservices-rg \
 --environment my-env \
 --image <registry>.azurecr.io/api-gateway:v1 \
 --target-port 3000 \
 --ingress external \
 --env-vars \
 USER_SERVICE_URL=https://user-service \
 ORDER_SERVICE_URL=https://order-service
```

## 🌍 Endpoints

### API Gateway

- GET /users-with-orders

### User Service (Direct)

- GET /users
- POST /users

### Order Service (Direct)

- GET /orders
- GET /orders?userId=1
- POST /orders

## 🧪 Testing

### API Gateway

- curl https://<api-gateway-url>/users-with-orders

### User Service

- curl https://<user-service-url>/users

### Order Service

- curl https://<order-service-url>/orders

## ⚠️ Common Issues

- ❌ PostgreSQL Timeout
- Enable public access
- Add firewall rule:
  0.0.0.0 - 255.255.255.255
- ❌ MongoDB Atlas Connection Error
  Add IP:
  0.0.0.0/0
- ❌ API Gateway Timeout
  Ensure correct public URLs,
  Increase Axios timeout

## 🚀 Future Improvements

- Switch to internal communication (more secure)
- Add API Gateway authentication
- Implement CI/CD pipeline
- Use Kubernetes (AKS)
- Add monitoring and logging

⭐ Notes

## This project demonstrates:

- Microservices architecture
- Multi-database design (SQL + NoSQL)
- Real-world cloud deployment challenges
- Debugging networking issues in cloud environments

🤝 Contributing

Feel free to fork and improve this project!

⭐ Support

If you like this project, give it a ⭐ on GitHub!
