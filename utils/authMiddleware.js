const { handleHttpError } = require("./handleError");
const { verifyToken } = require("./handleJWT");


const authMiddleware = async (req, res, next) => {
  let descripcion_error = "Se ha producido un error en la autorización: ";
  let codigo_error = 401;

  try {
    const autorizacion = req.headers.authorization;

    if (!autorizacion) {
      descripcion_error = "NOT TOKEN: ";
      throw new Error("No se proporciona un token de autorización");
    }

    const token = autorizacion.split(" ").pop();  // Obtiene el token del header
    const datosToken = await verifyToken(token); // Verifica el token con la función verifyToken

    if (!datosToken._id) {
      descripcion_error = "ERROR_TOKEN: ";
      throw new Error("Token inválido, sin _id");
    }

    // Asocia el usuario al request
    req.user = {
      id: datosToken._id,
      email: datosToken.email,
      role: datosToken.role
    };

    next(); // Continúa al siguiente middleware

  } catch (err) {
    handleHttpError(res, descripcion_error + err.message, codigo_error);
  }
};
module.exports = authMiddleware;