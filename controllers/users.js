
const CompanyModel = require("../models/company");
const UserModel = require("../models/users");
const {cifrar, descrifrarComparar} = require("../utils/handlePassword");
const {JWTSign } =require("../utils/handleJWT");
const {handleHttpError}= require("../utils/handleError");
const company = require("../models/company");

const actualizarItem=async (req, res) =>{
  let descripcion_error = "Error al actualizar los datos personales";
  let codigo_error = 500;
  try{
    const email = req.body.email;
    const user=await UserModel.findOneAndUpdate({email}, {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      nif: req.body.nif
    });
    res.status(200).json({
        _id: user._id,
        email: user.email,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        nif: req.body.nif,
        estadoValidacion: user.estadoValidacion,
        role: user.role
    });
  }catch(err){
    handleHttpError(res, descripcion_error, codigo_error);
  }
}

const incluirItem= async (req,res) =>{
  let descripcion_error = "Error al incluir los datos de la compañia"
  let codigo_error = 500;
  try {
    let companyData= req.body.company;
    let user= await UserModel.findOne({email: req.body.email})

    if (req.body.esAutonomo) {
      companyData = {
        nombre: user.nombre,
        cif: user.nif,
        direccion: user.direccion,
        provincia: "No aplica",
        pais: "No aplica"
      };
    }

    const nuevaCompania = await CompanyModel.create(companyData);
    user= await UserModel.findOneAndUpdate({email: req.body.email},{companyId: nuevaCompania._id})

    res.status(200).json({
      _id: user._id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      nif: user.nif,
      estadoValidacion: user.estadoValidacion,
      role: user.role,
      company: {
        _id: nuevaCompania._id,
        nombre: nuevaCompania.nombre,
        cif: nuevaCompania.cif,
        direccion: nuevaCompania.direccion,
        provincia: nuevaCompania.provincia,
        pais: nuevaCompania.pais
      }
    });
  } catch (err) {
    handleHttpError(res, descripcion_error, codigo_error);  
  }
};

const obtenerDatos =  async (req, res) => {
  let descripcion_error = "ERROR_GET_USER";
  let codigo_error = 500
  try {
    const user = await UserModel.find({deleted: false});
    res.status(200).json(user);
  } catch (err) {
    handleHttpError(res, descripcion_error, codigo_error);
  }
}
const obtenerDato =  async (req, res) => {
  let descripcion_error = "ERROR_GET_USER";
  let codigo_error = 500
  try {
    const user = await UserModel.findOne({email: req.params.email, deleted: false});
    if(user == null){
      descripcion_error="Usuario no encontrado"
      codigo_error=404
      throw err;
    }
    res.status(200).json(user);
  } catch (err) {
    handleHttpError(res, descripcion_error, codigo_error);
  }
}

const eliminarDato = async (req, res) => {
  try {
    let mensaje;
    if (req.query.soft !== "false") {
      const user = await UserModel.findOneAndUpdate({email:req.params.email}, { deleted: true });
      mensaje= "Usuario desactivado (soft delete): " + user;
    } else {
      await UserModel.findOneAndUpdate(req.params.email);
      mensaje ="Usuario eliminado permanentemente";
    }
    res.status(200).json({ message: mensaje });
    
  } catch (err) {
    handleHttpError(res, "ERROR_DELETE_USER", 500);
  }
}
const recuperarCuenta = async (req, res) => {
  let descripcion_error = "ERROR_RECOVER_ACCOUNT"
  let codigo_error = 500
  try {
    const user = await UserModel.findOneAndUpdate({email: req.params.email},{ deleted: false });

    if (!user){
      codigo_error=404
      descripcion_error="Usuario no encontrado"
      throw err;
    }

    res.status(200).json({ user });
  } catch (err) {
    handleHttpError(res, descripcion_error, codigo_error);
  }
}
const invitar = async (req, res) => {
  let descripcion_error="ERROR_INVITAR_USUARIO";
  let codigo_error =500;
  try {
    const email = req.body.email;

    const usuarioExiste = await UserModel.findOne({ email });
    if (usuarioExiste){
      descripcion_error="Este usuario ya existe";
      codigo_error=409;
      throw err;

    }
    const CompañiaExiste = await CompanyModel.findOne(req.body.company);
    if (!CompañiaExiste){
      descripcion_error="La compañía indicada no existe";
      codigo_error=404;
      throw err;
    }
    const companyId = CompañiaExiste._id;

    //ciframos la contraseña
    if((typeof req.body.password) != String){
      password=(req.body.password).toString();
    }
    password=await cifrar(password);


    // Se generará un código aleatorio de seis dígitos.
    const codigoAleatorio = Math.floor(100000 + Math.random() * 900000);
    
    const nuevoUsuario = await UserModel.create({
      email:email,
      password: password,
      role: ["guest"],
      codigoValidacion: codigoAleatorio,
      companyId: companyId,
      estadoValidacion: "noValidado",
    });
    // Generamos un token para pasarselo a nuestro usuario.
    const token=await JWTSign(nuevoUsuario);

    res.status(201).json(
      {
          email: nuevoUsuario.email,
          Verificado: nuevoUsuario.estadoValidacion,
          role: nuevoUsuario.role,
          company: nuevoUsuario.companyId,
          token
      }
  );
  } catch (err) {
    handleHttpError(res, descripcion_error, codigo_error);
  }
}



//SOLICITAR CONTRASEÑA
const enviarPeticion= async (req, res) => {
  let descripcion_error="ERROR_RECOVERY_REQUEST";
  let codigo_error =500;
  try {
    const  email  = req.params.email;
    
    const codigo = Math.random().toString(36).substring(2, 10);
    const user = await UserModel.findOneAndUpdate({ email }, {codigoVerificacion: codigo.toString()}, { new: true });

    if (!user){
      codigo_error=404;
      descripcion_error="Usuario no encontrado";
      throw err;

    } 
    console.log(`Codigo para ${email}: ${user.codigoVerificacion}`);

    res.status(200).json( `Codigo para ${email}: ${user.codigoVerificacion}` );
  } catch (err) {
    handleHttpError(res, descripcion_error, codigo_error);
  }
}

// ENTREGAR RECUPERACION
const confirmarPeticion = async (req, res) => {
  let descripcion_error="ERROR_CONFIRMAR_RECUPERACION";
  let codigo_error =500;
  try {
    let { email, codigo, nuevaContraseña } = req.body;

    //ciframos la contraseña
    nuevaContraseña=await cifrar(nuevaContraseña);

    const user = await UserModel.findOneAndUpdate({ email}, {password: nuevaContraseña});
    if (!user || user.codigoVerificacion != codigo){
      codigo_error=400;
      descripcion_error="Código inválido o usuario no encontrado";
      throw err;

    } 
    

    res.status(200).json( `La contraseña para ${email}: ${ user.password}` );
  } catch (err) {
    handleHttpError(res, descripcion_error, codigo_error);
  }
}

module.exports = { actualizarItem,incluirItem, obtenerDatos, obtenerDato, eliminarDato,eliminarDato, recuperarCuenta,invitar, enviarPeticion, confirmarPeticion };

