const { validationResult } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");

const handleValidator = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorDetails = errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg
      }));

      return res.status(422).json({
        message: "Errores de validación",
        errores: errorDetails
      });
    }
    next();
  } catch (err) {
    handleHttpError(res, "Error al validar los datos", 500);
  }
};

module.exports = handleValidator;
