const ClientModel = require("../models/client");
const UserModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");

const createClient = async (req, res) => {
  let description_error = "ERROR_CREATE_CLIENTE";
  let code_error = 500;
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const { nombre, email, telefono, direccion } = req.body;
    console.log("Request Body:", req.body); // Log para depurar los datos enviados

    const existe = await ClientModel.findOne({
      nombre,
      userId: userId
    });

    if (existe) {
      description_error = "Cliente ya registrado";
      code_error = 409;
      throw new Error("El cliente ya existía");
    }

    const nuevoCliente = await ClientModel.create({
      ...req.body,
      userId,
      companyId: user.companyId || null
    });

    res.status(201).json(nuevoCliente);
  } catch (err) {
    console.error("Error creating client:", err);
    handleHttpError(res, description_error, code_error);
  }
};


const getClients = async (req, res) => {
  let descripcion_error = "ERROR_GET_CLIENTES";
  let code_error = 500;
  try {
    const userId = req.user.id;

    const clientes = await ClientModel.find({
      archivado: false,
      userId: userId
    });

    res.status(200).json(clientes);
  } catch (err) {
    handleHttpError(res, descripcion_error, code_error);
  }
};

const getClientById = async (req, res) => {
  let descripcion_error = "ERROR_GET_CLIENTES";
  let code_error = 500;

  try {
    const cliente = await ClientModel.findById(req.params.id);
    if (!cliente) {
      descripcion_error = "Cliente no encontrado";
      code_error = 404;
      throw new Error("No existe el cliente");
    }
    res.status(200).json(cliente);
  } catch (err) {
    handleHttpError(res,descripcion_error, code_error);
  }
};


const updateClient = async (req, res) => {
  let descripcion_error = "ERROR_ACTUALIZAR_CLIENTES";
  let code_error = 500;

  try {
    const cliente = await ClientModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!cliente) {
      descripcion_error = "Cliente no encontrado";
      code_error = 404;
      throw new Error("No existe el cliente");
    }

    res.status(200).json(cliente);
  } catch (err) {
    handleHttpError(res, descripcion_error, code_error);
  }
};

const deleteClient = async(req, res) =>{

  let descripcion_error = "ERROR_DELETE_CLIENTE";
  let code_error = 500;

  try {
    const { id } = req.params;
    const { soft } = req.query;

    if(soft !=='false'){
      const cliente = await ClientModel.findByIdAndUpdate(
        id,
        { archivado: true },
        { new: true }
      );
      if (!cliente) {
        descripcion_error = "Cliente no encontrado";
        code_error = 404;
        throw new Error("No existe el cliente");
      }  
      res.status(200).json({ message: "Cliente archivado (soft delete)", cliente });
    }else{
      const cliente = await ClientModel.findByIdAndDelete(id);
      
      if (!cliente) {
        descripcion_error = "Cliente no encontrado";
        code_error = 404;
        throw new Error("No existe el cliente");
      }

      res.status(200).json({ message: "Cliente eliminado permanentemente" });

    }
    
  } catch (error) {
      handleHttpError(res, descripcion_error, code_error);
  }

}


const restoreClient = async (req, res) => {
  let descripcion_error = "ERROR_RESTAURAR_CLIENTES";
  let code_error = 500;
  try {
    const cliente = await ClientModel.findByIdAndUpdate(
      req.params.id,
      { archivado: false },
      { new: true }
    );

    if (!cliente) {
      descripcion_error = "Cliente no encontrado";
      code_error = 404;
      throw new Error("No existe el cliente");
    }

    res.status(200).json({ message: "Cliente restaurado", cliente });
  } catch (err) {
    handleHttpError(res, descripcion_error, code_error);
  }
};

const getArchivedClients = async (req, res) => {
  let descripcion_error = "ERROR_GET_CLIENTES_ARCHIVADOS";
  let code_error = 500;
  try {
    const userId = req.user.id;

    const clientesArchivados = await ClientModel.find({
      archivado: true,
      userId: userId
    });

    res.status(200).json(clientesArchivados);
  } catch (err) {
    handleHttpError(res, descripcion_error , code_error);
  }
};

module.exports = {createClient, getClients, getClientById,updateClient,deleteClient, restoreClient, getArchivedClients};