const { check } = require("express-validator");

const clientValidator = [
  check("nombre").notEmpty().withMessage("El nombre del cliente es obligatorio"),
  check("nif").optional().isLength({ min: 8 }).withMessage("El NIF debe tener al menos 8 caracteres"),
  check("email").optional().isEmail().withMessage("Debe ser un email válido"),
  check("telefono").optional().isMobilePhone("es-ES").withMessage("Número de teléfono inválido"),
  check("direccion").optional().isLength({ min: 3 }).withMessage("La dirección debe tener al menos 3 caracteres")
];

module.exports = { clientValidator };
