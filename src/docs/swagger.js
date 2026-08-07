const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aytin eCommerce API',
      version: '1.0.0',
      description: `
        Production-ready eCommerce backend for Aytin.
        
        ## Features
        - Admin Authentication (JWT + Refresh Tokens)
        - Role-Based Access Control (Admin, Manager, Employee)
        - Product Management with Variants, Images, SEO
        - Category (Nested), Collection Management
        - Order Management with Timeline & RTO
        - Customer Management
        - Dashboard Analytics & Reports
        - Global Search with Suggestions
        - Image Upload with Sharp Compression & Cloudinary
        - Inventory & Low Stock Alerts
      `,
      contact: {
        name: 'Aytin Support',
        email: 'support@aytin.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your admin JWT token',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object', nullable: true },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' },
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' },
              },
            },
            errors: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@aytin.com' },
            password: { type: 'string', format: 'password', example: 'Admin@123' },
          },
        },
        PaginationParams: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 20 },
            sort: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Website - Products', description: 'Public product API' },
      { name: 'Website - Auth', description: 'Customer authentication' },
      { name: 'Website - Orders', description: 'Customer order placement' },
      { name: 'Admin - Auth', description: 'Admin authentication & management' },
      { name: 'Admin - Products', description: 'Product CRUD & management' },
      { name: 'Admin - Categories', description: 'Category management with nesting' },
      { name: 'Admin - Collections', description: 'Collection management' },
      { name: 'Admin - Orders', description: 'Order management' },
      { name: 'Admin - Customers', description: 'Customer management' },
      { name: 'Admin - Dashboard', description: 'Dashboard analytics' },
      { name: 'Admin - Upload', description: 'Image upload (local & Cloudinary)' },
      { name: 'Admin - Search', description: 'Global search' },
      { name: 'Admin - Shipping', description: 'Courier & RTO management' },
    ],
  },
  apis: [
    './src/routes/website/*.js',
    './src/routes/admin/*.js',
  ],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;

