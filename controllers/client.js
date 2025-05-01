const ClientModel = require("../models/client");
const UserModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");

const createClient = async (req, res) => {
  let description_error= "ERROR_CREATE_CLIENTE";
  let code_error = 500;
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const { nombre } = req.body;

    const existe = await ClientModel.findOne({
      nombre,
      userId: userId
    });

    if (existe) {
      description_error= "Cliente ya registrado";
      code_error= 409;
      throw new Error("El cliente ya existia");
    }

    const nuevoCliente = await ClientModel.create({
      ...req.body,
      userId,
      companyId: user.companyId || null
    });

    res.status(201).json(nuevoCliente);
  } catch (err) {
    handleHttpError(res, description_error, code_error);
  }
};



module.exports = {createClient};