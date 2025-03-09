# Everstory Backend

## Overview

Everstory is a memory-driven social platform designed to help users store, organize, and relive their most cherished moments. This backend is built using **NestJS** and **MongoDB**, structured as a microservices architecture for scalability and maintainability.

## Microservices Architecture

The backend consists of three independent microservices:

1. **Auth Service** - Handles user authentication, profile management, and follow/unfollow functionality.
2. **Image Service** - Manages image uploads, visibility settings, and secure delivery.
3. **Friendship Service** - Handles friend requests, manages connections, and retrieves friend lists.

Each service is containerized using **Docker**

---

## Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Token)
- **Storage:** Cloudinary
- **Containerization:** Docker
- **API Gateway:** Nginx / API Gateway

---

## Setup & Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (v16+)
- Docker & Docker Compose
- MongoDB (local or cloud instance)
- Kubernetes (Minikube or any Kubernetes cluster)

### Clone the Repository

```bash
git clone git@github.com:VarunRam7/Everstory-BE.git
cd backend
```

### Environment Variables

Create a `.env` file in the root directory of each microservice and configure the following variables:

#### Auth Service (`/auth/.env`)

```env
JWT_SECRET=3R2bF5Y23nXYoUHz4/RoCwlgGVv0lbmhMHJeVk50uMg=
MONGO_URI=mongodb://admin:password@localhost:27017
PORT=5000
DB_NAME=Everstory
```

#### Image Service (`/image/.env`)

```env
CLOUDINARY_CLOUD_NAME=df8c3o04g
CLOUDINARY_API_KEY=898575765165319
CLOUDINARY_API_SECRET=g3PeXQyg-R1nBr813Wgce9z_Jdw

MONGO_URI=mongodb://admin:password@localhost:27017
PORT=5001
DB_NAME=Everstory
```

#### Friendship Service (`/friendship/.env`)

```env
MONGO_URI=mongodb://admin:password@localhost:27017
PORT=5002
DB_NAME=Everstory
```

---

## Running Locally

### Install Dependencies

Run the following command in each microservice folder:

```bash
npm install
```

### Start Services

To start each service independently:

```bash
npm run start:dev
```

Or run all services using Docker Compose:

```bash
docker compose build
docker compose up
```

---
