const ProjectModel = require("../models/project");
const UserModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");

const createProject = async (req, res) => {
    let descripcion_error = "ERROR_CREATE_PROJECT";
    let code_error = 500;
    try {
      const userId = req.user.id;
      const user = await UserModel.findById(userId);
      const { nombre, clientId } = req.body;
  
      const existe = await ProjectModel.findOne({
        nombre,
        userId
      });
  
      if (existe) {
        descripcion_error = "Proyecto ya existe para este usuario";
        code_error=409;
        throw new Error("Proyecto ya existe para este usuario");
      }
      const nuevoProyecto = await ProjectModel.create({
        ...req.body,
        userId,
        companyId: user.companyId || null
      });
  
      res.status(201).json(nuevoProyecto);
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};


const getProjects = async (req, res) => {
    let descripcion_error = "ERROR_GET_PROJECTS";
    let code_error = 500;
    try {
        const userId = req.user.id;
        const proyectos = await ProjectModel.find({
            archivado: false,
            userId
        });
        res.status(200).json(proyectos);
    } catch (err) {
        handleHttpError(res,descripcion_error , code_error);
    }
};


module.exports = {createProject, getProjects};