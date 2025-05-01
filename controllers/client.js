const ClientModel = require("../models/client");
const UserModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");

const createClient = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const { nombre } = req.body;

    const existe = await ClientModel.findOne({
      nombre,
      userId: userId
    });

    if (existe) return handleHttpError(res, "Cliente ya registrado", 409);

    const nuevoCliente = await ClientModel.create({
      ...req.body,
      userId,
      companyId: user.companyId || null
    });

    res.status(201).json(nuevoCliente);
  } catch (err) {
    handleHttpError(res, "ERROR_CREATE_CLIENTE", 500);
  }
};

module.exports = {createClient};