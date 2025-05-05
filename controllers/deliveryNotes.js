const ClientModel = require("../models/deliverynote");
const UserModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");
const { uploadToPinata } = require("../utils/handleStorageIPFS");
const { generarBufferPDF } = require("../utils/pdfGenerator");


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
const restoreDeliveryNote = async (req, res) => {
    let descripcion_error = "ERROR_RESTORE_DELIVERY_NOTE";
    let code_error = 500;
    try {
      const nota = await DeliveryNoteModel.findByIdAndUpdate(
        req.params.id,
        { archivado: false },
        { new: true }
      );
      if (!nota){
        descripcion_error = "Albarán no encontrado";
        code_error = 404;
        throw new Error("Albarán no encontrado");
      }
      res.status(200).json({ message: "Albarán restaurado", nota });
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};

const getArchivedDeliveryNotes = async (req, res) => {
    let descripcion_error ="ERROR_GET_ARCHIVED_DELIVERY_NOTES";
    let code_error = 500;
    try {
      const userId = req.user.id;
  
      const archivados = await DeliveryNoteModel.find({
        archivado: true,
        userId
      });
  
      res.status(200).json(archivados);
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};

const firmarDeliveryNote = async (req, res) => {
  let descripcion_error = "ERROR_FIRMAR_DELIVERY_NOTE";
  let code_error=500;
  try {
    const { id } = req.params;
    const fileBuffer = req.file?.buffer;
    const fileName = req.file?.originalname;

    if (!fileBuffer || !fileName) {

      descripcion_error=  "No se ha subido ninguna firma";
      code_error = 400;
      throw new Error("No se ha subido ninguna firma");
    }

    const deliveryNote = await DeliveryNoteModel.findById(id);

    if (!deliveryNote){
      descripcion_error=  "Albaran no encontrado";
      code_error = 404;
      throw new Error("Albaran no encontrado");
    }
    if (deliveryNote.firmado){
      descripcion_error= "El albaran ya está firmado";
      code_error = 409;
      throw new Error("El albaran ya está firmado");

    }

    const pinataRes = await uploadToPinata(fileBuffer, fileName);
    const ipfsUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${pinataRes.IpfsHash}`;

    deliveryNote.firmaUrl = ipfsUrl;
    deliveryNote.firmado = true;

    await deliveryNote.save();

    res.status(200).json({
      message: "Albaran firmado correctamente",
      firmaUrl: ipfsUrl
    });

  } catch (err) {
    handleHttpError(res, descripcion_error, code_error);
  }
};

const generarPDFDeliveryNote = async (req, res) => {
  let descripcion_error = "ERROR_GENERAR_PDF";
  let code_error = 500;

  try {
    const nota = await DeliveryNoteModel.findById(req.params.id)
      .populate("userId")
      .populate("clientId")
      .populate("projectId");

    if (!nota){
      descripcion_error="Albaran no encontrado";
      code_error=404;
      throw new Error("Albaran no encontrado");
    }

    // Solo el creador o su guest puede descargar
    const userId = req.user.id;
    if (nota.userId._id.toString() !== userId && (!nota.userId.role.includes("guest"))) {
      descripcion_error="Acceso no autorizado al PDF del albaran";
      code_error=403;
      throw new Error("Acceso no autorizado al PDF del albaran");
    }

    // Si ya tiene PDF subido a IPFS y esta firmado
    if (nota.firmado && nota.pdfUrl) {
      return res.redirect(nota.pdfUrl);
    }

    // Generar PDF en memoria
    const pdfBuffer = await generarBufferPDF(nota);

    // Si está firmado, subimos a IPFS y guardamos la URL
    if (nota.firmado) {
      const uploadRes = await uploadToPinata(pdfBuffer, `albaran-${nota._id}.pdf`);
      const url = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${uploadRes.IpfsHash}`;
      nota.pdfUrl = url;
      await nota.save();
    }

    // Enviar PDF al usuario como descarga
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="albaran-${nota._id}.pdf"`
    });

    res.send(pdfBuffer);

  } catch (err) {
    handleHttpError(res, descripcion_error, code_error);
  }
};
module.exports = {
  createDeliveryNote, 
  getDeliveryNotes, 
  getDeliveryNoteById, 
  updateDeliveryNote, 
  deleteDeliveryNote, 
  restoreDeliveryNote, 
  getArchivedDeliveryNotes,
  firmarDeliveryNote, generarPDFDeliveryNote };


