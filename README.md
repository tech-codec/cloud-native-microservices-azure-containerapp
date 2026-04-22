# 🚀 Cloud-Native Microservices Application (Node.js + Azure)

This project demonstrates a production-ready cloud-native microservices
architecture using:

- Node.js (Express)
- Docker & Docker Compose
- Azure Container Apps
- Azure PostgreSQL
- MongoDB Atlas

It showcases real-world cloud deployment, including networking, secrets
management, and service communication.

---

## 📌 Architecture Overview

![Architecture Diagram](./screenshorts/architecture%20overview.png)

![Architecture Diagram](./screenshorts/cloud-native-app.drawio.png)

---

## 🧱 Tech Stack

- Backend: Node.js (Express)
- Frontend: React (Vite + Nginx)
- Containerization: Docker
- Cloud: Azure Container Apps
- Registry: Azure Container Registry (ACR)
- Databases:
  - Azure PostgreSQL
  - MongoDB Atlas

---

## 📂 Project Structure

    .
    ├── api-gateway/
    ├── user-service/
    ├── order-service/
    ├── frontend/
    ├── postgres-init/
    ├── mongo-init/
    ├── docker-compose.yml
    ├── .env
    └── README.md

---

## ⚙️ Environment Variables

### 🔑 Global `.env`

    #PostgreSQL
    POSTGRES_USER=admin123
    POSTGRES_PASSWORD=Admin123
    POSTGRES_DB=userdb
    POSTGRES_PORT=5433

    #MongoDB
    MONGO_USER=mongouser
    MONGO_PASSWORD=mongopassword
    MONGO_PORT=27018

    #User Service
    USER_SERVICE_PORT=3001
    DATABASE_URL=postgres://admin123:Admin123@postgres:5432/userdb

    #Order Service
    ORDER_SERVICE_PORT=3002
    MONGO_URI=mongodb://admin123:Admin123@mongo:27017/ordersdb

    #API Gateway
    API_GATEWAY_PORT=3000
    USER_SERVICE_URL=http://user-service:3001
    ORDER_SERVICE_URL=http://order-service:3002
    FRONTEND_ORIGIN=http://localhost:5173

    #Frontend
    FRONTEND_PORT=5173
    VITE_API_URL=http://localhost:3000

---

## 🐳 Run Locally

    docker compose up --build

### Access

- Frontend → http://localhost:5173\
- API Gateway → http://localhost:3000\
- User Service → http://localhost:3001\
- Order Service → http://localhost:3002

### Test

    curl http://localhost:3000/users-with-orders

### Stop

    docker compose down

---

## ☁️ Azure Deployment

### Step 1: Resource Group

    az group create --name microservices-rg --location canadacentral

### Step 2: ACR

    az acr create --name microservicesacr --resource-group microservices-rg --sku Basic
    az acr login --name microservicesacr

### Step 3: Build & Push

    docker build -t microservicesacr.azurecr.io/api-gateway:v1 ./api-gateway
    docker push microservicesacr.azurecr.io/api-gateway:v1

(repeat for all services)

---

### Step 4: Container Apps Environment

    az containerapp env create \
      --name microservices-env \
      --resource-group microservices-rg \
      --location canadacentral

---

## 🟢 MongoDB Atlas

- Create cluster\
- Create user\
- Allow IP: 0.0.0.0/0

Connection string:

    mongodb+srv://user:password@cluster.mongodb.net/ordersdb

---

## 🟢 Azure PostgreSQL

- Create Flexible Server\
- Enable public access\
- Add firewall: 0.0.0.0 → 255.255.255.255

Connection:

    postgres://user:password@server.postgres.database.azure.com:5432/userdb?sslmode=require

---

## 🔐 Secrets

In Azure Portal → Container App → Secrets:

- mongo-uri\
- postgres-url

---

## 🚀 Deploy Services

### User Service

    az containerapp create \
     --name user-service \
     --resource-group microservices-rg \
     --environment microservices-env \
     --image microservicesacr.azurecr.io/user-service:v1 \
     --target-port 3001 \
     --ingress internal \
     --secrets postgres-url=<url> \
     --env-vars DATABASE_URL=secretref:postgres-url

### Order Service

    az containerapp create \
     --name order-service \
     --resource-group microservices-rg \
     --environment microservices-env \
     --image microservicesacr.azurecr.io/order-service:v1 \
     --target-port 3002 \
     --ingress internal \
     --secrets mongo-uri=<uri> \
     --env-vars MONGO_URI=secretref:mongo-uri

### API Gateway

    az containerapp create \
     --name api-gateway \
     --resource-group microservices-rg \
     --environment microservices-env \
     --image microservicesacr.azurecr.io/api-gateway:v1 \
     --target-port 3000 \
     --ingress external \
     --env-vars USER_SERVICE_URL=user-service-endpoint ORDER_SERVICE_URL=you-order-service-endpoint

---

## 🧪 Troubleshooting

### CORS Error

Set:

    FRONTEND_ORIGIN=https://your-frontend-url

### Timeout 502

    az containerapp logs show --name api-gateway --follow

### No replicas

    az containerapp update --min-replicas 1

---

## 💰 Cost Estimate

- Container Apps: \$5--15/month\
- PostgreSQL: \$15--25/month\
- MongoDB Atlas: Free tier\
- ACR: \~\$5/month

👉 Total: \~\$20--40/month

---

## 🚀 Future Improvements

- Azure Key Vault\
- JWT Authentication\
- CI/CD pipeline\
- Monitoring (App Insights)

---

## ⭐ What This Project Shows

- Real microservices architecture\
- SQL + NoSQL integration\
- Azure deployment skills\
- Networking & debugging

---

## 🤝 Contributing

Feel free to fork and improve!

---

## ⭐ Support

If this helped you, give it a ⭐
