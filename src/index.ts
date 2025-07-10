import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import { connectDatabase } from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";

// Routes
import authRoutes from "./routes/auth.route";
import artisanAuthRoutes from './routes/artisanAuth.route';
import adminRoutes from './routes/admin.route';

// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import openApiSpec from '../openapi.json';

const app = express();
const BASE_PATH = config.BASE_PATH;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Landing page
app.get('/', (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: 'Welcome to Homie App API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    endpoints: {
      baseUrl: config.SERVER_URL,
      apiDocs: `${config.SERVER_URL}${BASE_PATH}/docs`,
      healthCheck: `${config.SERVER_URL}/health`,
      auth: {
        register: `${config.SERVER_URL}${BASE_PATH}/auth/register`,
        login: `${config.SERVER_URL}${BASE_PATH}/auth/login`,
        verify: `${config.SERVER_URL}${BASE_PATH}/auth/verify/:userId`,
        logout: `${config.SERVER_URL}${BASE_PATH}/auth/logout`,
        refresh: `${config.SERVER_URL}${BASE_PATH}/auth/refresh`,
        forgotPassword: `${config.SERVER_URL}${BASE_PATH}/auth/forgot-password`,
        resetPassword: `${config.SERVER_URL}${BASE_PATH}/auth/reset-password`,
        googleOAuth: `${config.SERVER_URL}${BASE_PATH}/auth/google`
      }
    },
    documentation: {
      swagger: `${config.SERVER_URL}${BASE_PATH}/docs`,
      description: 'Complete API documentation with interactive examples'
    }
  });
});

// API Documentation (using static openapi.json)
app.use(`${BASE_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(openApiSpec));

// API base route
app.get(BASE_PATH, (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: 'Homie App API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    endpoints: {
      docs: `${config.SERVER_URL}${BASE_PATH}/docs`,
      auth: {
        register: `${config.SERVER_URL}${BASE_PATH}/auth/register`,
        login: `${config.SERVER_URL}${BASE_PATH}/auth/login`,
        verify: `${config.SERVER_URL}${BASE_PATH}/auth/verify/:userId`,
        logout: `${config.SERVER_URL}${BASE_PATH}/auth/logout`,
        refresh: `${config.SERVER_URL}${BASE_PATH}/auth/refresh`,
        forgotPassword: `${config.SERVER_URL}${BASE_PATH}/auth/forgot-password`,
        resetPassword: `${config.SERVER_URL}${BASE_PATH}/auth/reset-password`,
        googleOAuth: `${config.SERVER_URL}${BASE_PATH}/auth/google`
      }
    },
    documentation: `${config.SERVER_URL}${BASE_PATH}/docs`
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    baseUrl: config.SERVER_URL
  });
});

// API Routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/auth/artisan`, artisanAuthRoutes);
app.use(`${BASE_PATH}/admin`, adminRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      console.log(`📚 API Documentation available at ${config.SERVER_URL}${BASE_PATH}/docs`);
      console.log(`🏠 Landing page available at ${config.SERVER_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
