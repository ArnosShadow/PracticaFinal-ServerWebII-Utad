const { matchedData } = require("express-validator");
const AuthModel = require("../models/users");
const { handleHttpError } = require("../utils/handleError");
const {JWTSign } =require("../utils/handleJWT");
const {cifrar, descrifrarComparar} = require("../utils/handlePassword");
const {comprobarVerificadoEmail} = require("../utils/handleVerificador");
const { sendEmail } = require("../utils/handleEmail");


const createItem = async(req, res) =>{
    let descripcion_error = "ERROR: No se ha podido crear el usuario: ";
    let codigo_error = 400
    try{
        const body = matchedData(req);
        if((typeof body.password) != String){
            body.password=(body.password).toString();
        }
        
        //Comprobamos si el correo ya fue verificado.
        if (await comprobarVerificadoEmail(body.email, AuthModel)) {
            codigo_error = 409;
            descripcion_error = "ERROR: El email ya está registrado y verificado.";
            throw new Error(descripcion_error);
        }

        //ciframos la contraseña
        body.password=await cifrar(body.password);

        // Se generará un código aleatorio de seis dígitos.
        const codigoAleatorio = Math.floor(100000 + Math.random() * 900000);

        body.codigoValidacion = codigoAleatorio;

        console.log(codigoAleatorio);
        console.log(body);
        const result =await AuthModel.create(body);
        console.log("Recurso creado: "+result);
        
        // Enviar el código por correo
        await sendEmail({
            to: body.email,
            from: process.env.EMAIL,
            subject: "Código de validación",
            text: `Tu código de validación es: ${codigoAleatorio}`
        });
        // Generamos un token para pasarselo a nuestro usuario.
        const token=await JWTSign(result);

        res.status(201).json(
            {
                email: result.email,
                Verificado: result.estadoValidacion,
                role: result.role,
                codigoValidacion:codigoAleatorio,
                token
            }
        );
    }catch(err){
        handleHttpError(res,descripcion_error + err, codigo_error);
    }

}

const validateItem = async (req, res) => {
    let descripcion_error = "Error en el servidor: ";
    let codigo_error = 500;

    try {
        
        const email = req.body.email;   
        const code = req.body.code;

        if (!email || !code) {
            descripcion_error = "Faltan datos obligatorios";
            codigo_error = 400;
            throw new Error(descripcion_error);
        }
        

        if ((code.toString()).length !== 6) {
            descripcion_error = "El código debe ser de 6 dígitos numéricos";
            codigo_error = 400;
            throw new Error(descripcion_error);
        }
        

        const usuario = await AuthModel.findOne({ email });

        if (!usuario) {
            descripcion_error = "Usuario no encontrado";
            codigo_error = 404;
            throw err;
        }
        if (code.toString() !== usuario.codigoValidacion.toString()) {
            descripcion_error = "Código de validación incorrecto";
            codigo_error = 400;
            throw new Error("Código de validación incorrecto");
        }
        await AuthModel.findOneAndUpdate({ email }, {estadoValidacion: "Validado"});

        res.status(200).json({ message: 'Usuario valido' });

    } catch (err) {
        handleHttpError(res, descripcion_error + err.message, codigo_error);
    }
};

const loginItem =async (req, res) =>{
    let descripcion_error = "Error en el login: ";
    let codigo_error = 400;

    try {
        const email= req.body.email;
        let password = req.body.password;
        if((typeof password) != String){
            password=(password).toString();
        }

        const result =  await AuthModel.findOne({email:email});
        console.log(result)

        const passwordCorrect = await descrifrarComparar(password, result.password);
        if (!passwordCorrect) {
        descripcion_error = "Contraseña incorrecta";
        throw new Error("Contraseña o email incorrecto");
        }
          
        const token=await JWTSign(result);

        res.status(200).json({
            id: result._id,
            email: result.email,
            Verificado: result.estadoValidacion,
            role: result.role,
            token
        });
    } catch (err) {
        handleHttpError(res,descripcion_error + err,codigo_error);
    }
};


module.exports = {createItem,validateItem,loginItem};