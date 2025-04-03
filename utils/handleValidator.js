const {validationResult} = require("express-validator");
const { handleHttpError } = require("./handleError");


const validateResult =(req,res,next) =>{

    try{
        validationResult(req).throw;
        return next();

    }catch(err){
        handleHttpError(res, {errors: err.array()}, 403);
    }

}

module.exports = validateResult;