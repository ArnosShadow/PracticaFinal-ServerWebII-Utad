const mongoose = require("mongoose");

const dbConnect = () =>{
    const db_uri = process.env.DB_URI;
    mongoose.set('strictQuery', false);
    console.log("Conectando a la BD.");
    try{
        mongoose.connect(db_uri);
    }catch(err){
        console.err("Error conectando a la BD: "+ err);
    }
    
    mongoose.connection.on("connected", () => "Conectado a la Base de Datos.");

}

module.exports = dbConnect;