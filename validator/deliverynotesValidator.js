const { check } = require("express-validator");

const deliveryNoteValidator = [
  check("clientId").notEmpty().withMessage("El ID del cliente es obligatorio").isMongoId()
  .withMessage("Debe ser un ID válido"),

  check("projectId").notEmpty().withMessage("El ID del proyecto es obligatorio").isMongoId()
  .withMessage("Debe ser un ID válido"),

  check("horas").optional().isArray().withMessage("El campo horas debe ser un array"),

  check("materiales").optional().isArray().withMessage("El campo materiales debe ser un array"),

  check("horas.*.descripcion").optional().notEmpty().withMessage("Cada hora debe tener una descripción"),

  check("horas.*.horas").optional().isNumeric().withMessage("Cada hora debe tener un número válido"),

  check("horas.*.trabajador").optional().notEmpty().withMessage("Cada hora debe indicar el trabajador"),

  check("materiales.*.descripcion").optional().notEmpty().withMessage("Cada material debe tener una descripción"),

  check("materiales.*.cantidad").optional().isNumeric().withMessage("Cada material debe tener una cantidad numérica"),

  check("materiales.*.unidad").optional().notEmpty().withMessage("Cada material debe tener una unidad")
];

module.exports = { deliveryNoteValidator };
