const ClientModel = require("../models/deliverynote");
const UserModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");


const createDeliveryNote = async (req, res) => {
    let descripcion_error = "ERROR_CREATE_DELIVERY_NOTE";
    let code_error = 500;
    try {
      const userId = req.user.id;
      const user = await UserModel.findById(userId);
  
      const nuevoAlbaran = await DeliveryNoteModel.create({
        ...req.body,
        userId,
        companyId: user.companyId || null
      });
  
      res.status(201).json(nuevoAlbaran);
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};

module.exports = {createDeliveryNote};


