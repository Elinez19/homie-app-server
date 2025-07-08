import { Options } from 'swagger-jsdoc';
import { config } from './app.config';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Home Service Provider API',
      version: '1.0.0',
      description: 'API documentation for the Home Service Provider platform',
      contact: {
        name: 'API Support',
        email: 'support@homie-app.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}${config.BASE_PATH}`,
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Service Providers',
        description: 'Service provider management endpoints'
      },
      {
        name: 'Tasks',
        description: 'Service task management endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.ts'] // Path to the API routes with JSDoc comments
}; 