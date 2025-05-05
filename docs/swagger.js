const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Gestión de Albaranes API",
      version: "1.0.0",
      description: "API para la gestión de usuarios, clientes, proyectos y albaranes, con firma y generación de PDFs.",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "U-TAD - Ricardo Palacios",
        url: "https://u-tad.com",
        email: "ricardo.palacios@u-tad.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        user: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "usuario@empresa.com"
            },
            password: {
              type: "string",
              example: "contraseñaSegura123"
            },
            nombre: {
              type: "string",
              example: "Juan"
            },
            apellido: {
              type: "string",
              example: "Pérez"
            },
            nif: {
              type: "string",
              example: "12345678A"
            }
          }
        },
        login: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "usuario@empresa.com"
            },
            password: {
              type: "string",
              example: "contraseñaSegura123"
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
