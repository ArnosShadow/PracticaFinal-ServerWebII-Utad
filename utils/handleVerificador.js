const { handleHttpError } = require("./handleError");



const  comprobarVerificadoEmail = async (email, UserModel)=>{
   let estado= true;
   const verificado =await UserModel.findOne({email, estadoValidacion: "Validado"});

   if(!verificado){
        estado= false;
   }
   return estado;
}

module.exports = {comprobarVerificadoEmail};