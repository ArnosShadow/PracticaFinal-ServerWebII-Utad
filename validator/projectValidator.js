const { check } = require("express-validator");

const projectValidator = [
  check("nombre").notEmpty().withMessage("El nombre del proyecto es obligatorio"),
  check("clientId").notEmpty()
    .withMessage("El ID del cliente es obligatorio").isMongoId()
    .withMessage("El ID del cliente debe ser un ObjectId válido"),
  check("descripcion")
    .optional().isLength({ min: 3 })
    .withMessage("La descripción debe tener al menos 3 caracteres")
];

module.exports = { projectValidator };
