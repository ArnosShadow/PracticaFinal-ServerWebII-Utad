const handleHttpError = (res, descripcion_error, codigo_error = 403) =>{
    res.status(codigo_error).send(descripcion_error);
}
module.exports ={handleHttpError};