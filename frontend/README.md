# microservicesDC-frontend/README.md

# Microservices DC Frontend

This project is a React application that interacts with a microservices architecture, specifically fetching user data and their associated orders from an API Gateway.

## Getting Started

To get started with this project, follow the instructions below.

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd microservicesDC-frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

   Fill in the necessary environment variables in the `.env` file.

### Running the Application

To start the development server, run:

```bash
npm run dev
```

This will start the Vite development server, and you can view the application in your browser at `http://localhost:3000`.

### Building for Production

To build the application for production, run:

```bash
npm run build
```

This will create an optimized build of your application in the `dist` directory.

### Features

- Fetches users and their orders from the API Gateway.
- Displays user information and their respective orders.
- Responsive design with a clean user interface.

### Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.