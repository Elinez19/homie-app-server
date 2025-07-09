import { getEnv } from '../utils/get-env';

export const swaggerConfig = {
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
      url: getEnv('API_URL'),
      description: 'Local Development Server'
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
          role: { type: 'string', enum: ['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN'] },
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
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phoneNumber: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/auth/verify/{userId}': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify user email',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code'],
                properties: {
                  code: { type: 'string', minLength: 6, maxLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email verified successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          400: {
            description: 'Invalid verification code',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/auth/verify/resend/{userId}': {
      post: {
        tags: ['Authentication'],
        summary: 'Resend verification code',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Verification code resent',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          400: {
            description: 'Error resending code',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            accessToken: { type: 'string' },
                            refreshToken: { type: 'string' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/auth/google': {
      get: {
        tags: ['Authentication'],
        summary: 'Initiate Google OAuth login',
        description: 'Redirects to Google login page',
        responses: {
          302: {
            description: 'Redirect to Google login'
          }
        }
      }
    },
    '/auth/google/callback': {
      get: {
        tags: ['Authentication'],
        summary: 'Google OAuth callback',
        description: 'Handles Google OAuth callback and redirects to frontend with tokens',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          302: {
            description: 'Redirect to frontend with tokens',
            headers: {
              Location: {
                schema: {
                  type: 'string',
                  example: 'http://localhost:5173/auth/google/callback?accessToken=xyz&refreshToken=abc'
                }
              }
            }
          },
          400: {
            description: 'OAuth error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Reset instructions sent',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          400: {
            description: 'Invalid or expired token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            accessToken: { type: 'string' },
                            refreshToken: { type: 'string' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: 'Invalid refresh token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  }
}; 