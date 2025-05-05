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
        },
        client: {
          type: "object",
          properties: {
            nombre: {
              type: "string",
              example: "Empresa S.L."
            },
            email: {
              type: "string",
              example: "cliente@empresa.com"
            },
            telefono: {
              type: "string",
              example: "+34600111222"
            },
            direccion: {
              type: "string",
              example: "Calle Falsa 123, Madrid"
            },
            nif: {
              type: "string",
              example: "12345678A"
            }
          },
          required: ["nombre"]
        },
        project: {
          type: "object",
          properties: {
            nombre: {
              type: "string",
              example: "Proyecto reforma oficina"
            },
            descripcion: {
              type: "string",
              example: "Reforma integral de instalación eléctrica"
            },
            clientId: {
              type: "string",
              example: "661f735e32bc839c3d1b9d2b"
            }
          },
          required: ["nombre", "clientId"]
        },
        deliveryNote: {
          type: "object",
          properties: {
            clientId: {
              type: "string",
              example: "661f735e32bc839c3d1b9d2b"
            },
            projectId: {
              type: "string",
              example: "661f742532bc839c3d1b9d41"
            },
            horas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trabajador: {
                    type: "string",
                    example: "Carlos López"
                  },
                  descripcion: {
                    type: "string",
                    example: "Montaje de cableado"
                  },
                  horas: {
                    type: "number",
                    example: 6
                  }
                }
              }
            },
            materiales: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  descripcion: {
                    type: "string",
                    example: "Bobina de cable"
                  },
                  cantidad: {
                    type: "number",
                    example: 3
                  },
                  unidad: {
                    type: "string",
                    example: "unidad"
                  }
                }
              }
            },
            observaciones: {
              type: "string",
              example: "Trabajo realizado sin incidencias"
            }
          },
          required: ["clientId", "projectId"]
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
