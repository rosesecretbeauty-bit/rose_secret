// ============================================
// Swagger/OpenAPI Configuration
// ============================================
// FASE 5: Configuración de documentación de API

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rose Secret API',
      version: '1.0.0',
      description: 'API REST para e-commerce de productos de belleza',
      contact: {
        name: 'Rose Secret Team'
      },
      license: {
        name: 'ISC'
      }
    },
    servers: [
      {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.rosesecret.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint /api/auth/login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Mensaje de error amigable'
            },
            errorId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array de errores (solo en ValidationError)'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta (varía por endpoint)'
            }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'No autenticado o token inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Credenciales inválidas',
                errorId: '550e8400-e29b-41d4-a716-446655440000'
              }
            }
          }
        },
        Forbidden: {
          description: 'Sin permisos para acceder al recurso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'No tienes permisos para realizar esta acción',
                errorId: '550e8400-e29b-41d4-a716-446655440000'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Recurso no encontrado',
                errorId: '550e8400-e29b-41d4-a716-446655440000'
              }
            }
          }
        },
        ValidationError: {
          description: 'Errores de validación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Los datos proporcionados no son válidos',
                errorId: '550e8400-e29b-41d4-a716-446655440000',
                errors: ['El campo email es requerido', 'El campo password debe tener al menos 8 caracteres']
              }
            }
          }
        },
        RateLimitError: {
          description: 'Demasiadas solicitudes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Demasiadas solicitudes. Por favor intenta más tarde',
                errorId: '550e8400-e29b-41d4-a716-446655440000',
                retryAfter: 60
              }
            }
          },
          headers: {
            'Retry-After': {
              schema: {
                type: 'integer',
                example: 60
              }
            },
            'X-RateLimit-Limit': {
              schema: {
                type: 'integer',
                example: 100
              }
            },
            'X-RateLimit-Remaining': {
              schema: {
                type: 'integer',
                example: 0
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/**/*.js',
    './routes/**/*.yaml',
    './index.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

