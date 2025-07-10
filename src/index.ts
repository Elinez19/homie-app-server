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

// Load OpenAPI spec
const openApiPath = path.resolve(__dirname, '../openapi.json');
let openApiSpec = {};
try {
  openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
} catch (e) {
  openApiSpec = { openapi: '3.0.0', info: { title: 'Homie App API', version: '1.0.0' }, paths: {} };
}

// Serve the raw OpenAPI JSON
app.get('/api/docs/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Serve Swagger UI, configured to use the above JSON
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: {
      url: '/api/docs/openapi.json',
    },
    customSiteTitle: 'Homie App API Docs',
  })
);

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
