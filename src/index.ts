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

// Swagger documentation
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './config/swagger.config';

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

// API Documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use(`${BASE_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(specs));

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

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      console.log(`📚 API Documentation available at ${config.SERVER_URL}${BASE_PATH}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
