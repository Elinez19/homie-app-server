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

// Swagger documentation

const app = express();
const BASE_PATH = config.BASE_PATH;

// Swagger setup (before static and other routes)
const openApiPath = path.resolve(__dirname, '../openapi.json');
let openApiSpec = {};
try {
  openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
} catch (e) {
  openApiSpec = { openapi: '3.0.0', info: { title: 'Homie App API', version: '1.0.0' }, paths: {} };
}
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/docs/swagger.json', (req, res) => {
  res.json(openApiSpec);
});

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

// API Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Homie App API',
    version: '1.0.0',
    description: 'API documentation for Homie App - A platform connecting customers with skilled artisans'
  },
  servers: [
    {
      url: config.SERVER_URL + BASE_PATH,
      description: 'API Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    }
  },
  tags: [
    { name: 'auth', description: 'Authentication endpoints' },
    { name: 'artisan', description: 'Artisan-specific endpoints' },
    { name: 'admin', description: 'Admin endpoints' }
  ],
  paths: {
    [`${BASE_PATH}/auth/register`]: {
      post: {
        tags: ['auth'],
        summary: 'Register a new user',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                },
                required: ['email', 'password', 'firstName', 'lastName']
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully'
          }
        }
      }
    },
    [`${BASE_PATH}/auth/login`]: {
      post: {
        tags: ['auth'],
        summary: 'Login user',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful'
          }
        }
      }
    },
    [`${BASE_PATH}/auth/artisan/register`]: {
      post: {
        tags: ['artisan'],
        summary: 'Register a new artisan',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  businessName: { type: 'string' },
                  businessLicense: { type: 'string' },
                  serviceCategories: { type: 'array', items: { type: 'string' } },
                  serviceAreas: { type: 'array', items: { type: 'string' } }
                },
                required: ['email', 'password', 'firstName', 'lastName', 'businessName', 'businessLicense', 'serviceCategories', 'serviceAreas']
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Artisan registered successfully'
          }
        }
      }
    }
  }
};

app.use(`${BASE_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
