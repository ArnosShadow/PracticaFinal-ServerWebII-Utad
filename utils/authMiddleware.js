const { handleHttpError } = require("./handleError");
const { verifyToken } = require("./handleJWT");

const authMiddleware = async (req, res, next)=>{
    codigo_error=401;
    descripcion_error="Se ha producido un error en la autorizacion: ";
    try{

        const autorizacion=req.headers.authorization;

        if(!autorizacion){
            descripcion_error="NOT TOKEN: ";
            throw err;
        }
        
        const token =autorizacion.split(" ").pop();
        const datosToken = await verifyToken(token);
        if(!datosToken._id){
            descripcion_error= "ERROR_TOKEN: ";
            throw err;
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
          };

        next();

    }catch(err){
        handleHttpError(res,descripcion_error + err,codigo_error);
    }
}


module.exports = {authMiddleware};