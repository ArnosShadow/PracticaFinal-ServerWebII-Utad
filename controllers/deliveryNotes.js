const ClientModel = require("../models/deliverynote");
const UserModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");


const createDeliveryNote = async (req, res) => {
    let descripcion_error = "ERROR_CREATE_DELIVERY_NOTE";
    let code_error = 500;
    try {
      const userId = req.user.id;
      const user = await UserModel.findById(userId);
  
      if (!user) {
        descripcion_error = "Usuario no encontrado";
        code_error= 404;
        throw new Error("Usuario no encontrado"); 
      }


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

const getDeliveryNotes = async (req, res) => {
    let descripcion_error = "ERROR_GET_DELIVERY_NOTES";
    let code_error = 500;
    try {
      const userId = req.user.id;
  
      const notas = await DeliveryNoteModel.find({
        archivado: false,
        userId
      });
  
      res.status(200).json(notas);
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};


const getDeliveryNoteById = async (req, res) => {
    let descripcion_error = "ERROR_GET_DELIVERY_NOTE";
    let code_error = 500;
    try {
      const nota = await DeliveryNoteModel.findById(req.params.id);
      if (!nota){
        code_error=404;
        descripcion_error = "Albarán no encontrado";
        throw new Error("Albarán no encontrado");
      }

      res.status(200).json(nota);
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};

const updateDeliveryNote = async (req, res) => {
    let descripcion_error = "ERROR_UPDATE_DELIVERY_NOTE";
    let code_error = 500;

    try {
      const notaExistente = await DeliveryNoteModel.findById(req.params.id);
      if (!notaExistente) {
        descripcion_error= "Albaran no encontrado";
        code_error= 404;
        throw new Error("Albaran no encontrado");
      }

      const nota = await DeliveryNoteModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
  
      res.status(200).json(nota);
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};

const deleteDeliveryNote = async (req, res) => {
    let descripcion_error = "ERROR_DELETE_DELIVERY_NOTE";
    let code_error = 500;
    try {
      const { id } = req.params;
      const { soft } = req.query;
  
      const albaran = await DeliveryNoteModel.findById(id);
      if (!albaran){
        descripcion_error = "Albaran no encontrado";
        code_error=404;
        throw new Error("Albaran no encontrado"); 
      }
      if (albaran.firmado){
        descripcion_error = "No se puede eliminar un albaran firmado";
        code_error = 403;
        throw new Error("No se puede eliminar un albaran firmado");
      } 
  
      if (soft !== "false") {
        albaran.archivado = true;
        await albaran.save();
        res.status(200).json({ message: "Albarán archivado", albaran});
      } else {
        await DeliveryNoteModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Albarán eliminado definitivamente" });
      }
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};

module.exports = {createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, updateDeliveryNote, deleteDeliveryNote };


