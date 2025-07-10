import { config } from './app.config';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Homie App API Documentation',
      version: '1.0.0',
      description: 'API documentation for Homie App authentication service',
      contact: {
        name: 'API Support',
        email: 'support@homieapp.com'
      }
    },
    servers: [
      {
        url: config.SERVER_URL,
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phoneNumber: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['CUSTOMER', 'ARTISAN', 'ADMIN'] },
            status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED'] },
            isEmailVerified: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: {
              type: 'object',
              properties: {
                details: { type: 'string' }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object', nullable: true }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // Path to the API docs
}; 