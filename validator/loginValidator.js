const {check} = require("express-validator");
const validateResult = require ("../utils/handleValidator");


const loginValidator = [

    check("email")
    .exists().withMessage("Tiene que poner un email")
    .notEmpty().withMessage("El email no puede estar vacío"),
    check("password")
    .exists().withMessage("Tiene que poner una contraseña")
    .notEmpty().withMessage("La contraseña no puede ser vacia"),
    (req,res,next) => validateResult(req,res,next)
]
module.exports= {loginValidator};