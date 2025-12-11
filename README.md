# Revathi Enterprises - NestJS API

A comprehensive NestJS application with MongoDB, JWT Authentication, and Swagger documentation.

## Features

- **NestJS Framework**: Modern Node.js framework for building efficient applications
- **MongoDB Integration**: Database integration using Mongoose
- **JWT Authentication**: Secure authentication with JSON Web Tokens
- **Swagger Documentation**: Interactive API documentation
- **Docker Support**: Complete containerization with Docker and Docker Compose
- **User Management**: Complete CRUD operations for users
- **Input Validation**: Request validation using class-validator
- **Environment Configuration**: Configurable environment variables

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7 or higher)
- Docker (optional, for containerized deployment)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd revathi-enterprises
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL=mongodb://localhost:27017/revathi-enterprises
   JWT_SECRET=your-jwt-secret-key-here
   JWT_EXPIRES_IN=7d
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/revathi-enterprises
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Or install MongoDB locally
   # Follow MongoDB installation guide for your OS
   ```

## Running the Application

### Development Mode

```bash
# Start the application in development mode
npm run start:dev

# The application will be available at:
# - API: http://localhost:3000
# - Swagger Documentation: http://localhost:3000/api
```

### Production Mode

```bash
# Build the application
npm run build

# Start the application
npm run start:prod
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Users (Protected)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## API Documentation

The API documentation is available via Swagger UI at:
- **Development**: http://localhost:3000/api
- **Production**: https://your-domain.com/api

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. **Register a new user** or **login** to get an access token
2. **Include the token** in the Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # Authentication guards
│   ├── strategies/          # Passport strategies
│   ├── auth.controller.ts   # Authentication controller
│   ├── auth.module.ts       # Authentication module
│   └── auth.service.ts      # Authentication service
├── users/                   # Users module
│   ├── dto/                 # Data Transfer Objects
│   ├── schemas/             # MongoDB schemas
│   ├── users.controller.ts  # Users controller
│   ├── users.module.ts      # Users module
│   └── users.service.ts     # Users service
├── app.controller.ts        # Main application controller
├── app.module.ts           # Main application module
├── app.service.ts          # Main application service
└── main.ts                 # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/revathi-enterprises` |
| `JWT_SECRET` | JWT secret key | `your-jwt-secret-key-here` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

## Docker Commands

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the UNLICENSED License.

## Support

For support, please contact the development team or create an issue in the repository. 