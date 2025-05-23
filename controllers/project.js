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
const getProjectById = async (req, res) => {
    let descripcion_error = "ERROR_GET_PROJECT";
    let code_error = 500;
    try {
      const proyecto = await ProjectModel.findById(req.params.id);
      if (!proyecto){
        descripcion_error="Proyecto no encontrado";
        code_error=404;
        throw new Error("Proyecto no encontrado");
      } 
      res.status(200).json(proyecto);
    } catch (err) {
      handleHttpError(res,descripcion_error , code_error);
    }
};

const updateProject = async (req, res) => {
    let descripcion_error = "ERROR_UPDATE_PROJECT";
    let code_error = 500;
    try {
      const proyecto = await ProjectModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!proyecto) {
        descripcion_error= "Proyecto no encontrado";
        code_error= 404;
        throw new Error("Proyecto no encontrado");
      }

      res.status(200).json(proyecto);
    } catch (err) {
      handleHttpError(res, descripcion_error, code_error);
    }
};

const deleteProject = async (req, res) => {
  let descripcion_error = "ERROR_DELETE_PROJECT";
  let code_error = 500;
  try {
    const { id } = req.params;
    const { soft } = req.query;

    if (soft !== "false") {
      const proyecto = await ProjectModel.findByIdAndUpdate(
        id,
        { archivado: true },
        { new: true }
      );
      if (!proyecto) {
        descripcion_error = "Proyecto no encontrado";
        code_error = 404;
        throw new Error("Proyecto no encontrado"); 
      }
      res.status(200).json({ message: "Proyecto archivado", proyecto });
    } else {
      const proyecto = await ProjectModel.findByIdAndDelete(id);
      if (!proyecto) {
        descripcion_error = "Proyecto no encontrado";
        code_error = 404;
        throw new Error("Proyecto no encontrado"); 
      }
      res.status(200).json({ message: "Proyecto eliminado definitivamente" });
    }
  } catch (err) {
    handleHttpError(res, descripcion_error, code_error);
  }
};

const restoreProject = async (req, res) =>{
  let descripcion_error = "ERROR_RESTORE_PROJECT";
  let code_error = 500;

  try {
    const { id } = req.params;
    const proyecto = await ProjectModel.findByIdAndUpdate(
      id,
      { archivado: false },
      { new: true }
    );

    if(!proyecto){
      descripcion_error = "Proyecto no encontrado";
      code_error=404 ;
      throw new Error("Proyecto no encontrado");
    }
    res.status(200).json({ message: "Proyecto restaurado", proyecto, deleted: false });

  } catch (error) {
    handleHttpError(res, descripcion_error, code_error);
  }
}

const getArchivedProject = async(req, res) =>{
  let descripcion_error ="ERROR_GETARCHIVED_PROJECT";
  let code_error=500;
  try {
    const proyecto = await ProjectModel.find(
      { archivado: true }
    );

    if(!proyecto){
      descripcion_error = "No hay proyectos encontrados";
      code_error=404 ;
      throw new Error("No hay proyectos encontrados");
    }

    res.status(200).json({ message: "Proyectos encontrados", proyecto });
  } catch (error) {
    handleHttpError(res, descripcion_error, code_error)
  }

}


module.exports = {createProject, getProjects, getProjectById, updateProject, deleteProject, restoreProject, getArchivedProject};