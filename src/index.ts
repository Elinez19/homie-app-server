import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import { connectDatabase } from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

// Routes
import authRoutes from "./routes/auth.route";
import artisanAuthRoutes from './routes/artisanAuth.route';
import adminRoutes from './routes/admin.route';

const app = express();
const BASE_PATH = config.BASE_PATH;

// Read the Swagger JSON file
const swaggerFilePath = path.join(__dirname, '../openapi.json');
let swaggerDocument = {};
try {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));
} catch (e) {
  console.warn('Could not read openapi.json, using default swagger document');
  swaggerDocument = { 
    openapi: '3.0.0', 
    info: { 
      title: 'Homie App API', 
      version: '1.0.0',
      description: 'API documentation for Homie App'
    }, 
    paths: {} 
  };
}

// Setup the Swagger route with enhanced configuration
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Homie App API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayOperationId: false,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch']
  },
  explorer: true
}));

// Serve static files (landing page, assets)
app.use(express.static(path.join(__dirname, '../public')));

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

// Landing page (serve HTML)
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
      console.log(`📚 API Documentation available at ${config.SERVER_URL}/api/docs`);
      console.log(`🏠 Landing page available at ${config.SERVER_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
