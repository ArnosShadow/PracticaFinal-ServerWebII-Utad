const {check} = require("express-validator");
const validateResult = require ("../utils/handleValidator");

const validationResult = [
    check("email")
    .exists().withMessage("Tiene que poner un email")
    .notEmpty().withMessage("El email no puede estar vacío"),
    check("password")
    .exists().withMessage("Tiene que poner una contraseña")
    .notEmpty().withMessage("La contraseña no puede ser vacia")
    .isLength({min: 8}).withMessage("La contraseña debe tener al menos 8 catacteres"),
    (req,res,next) => validateResult(req,res,next)
]

module.exports = {validationResult};