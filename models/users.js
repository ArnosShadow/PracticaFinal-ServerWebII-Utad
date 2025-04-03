const mongoose = require("mongoose")


const UserScheme = new mongoose.Schema(
    {
        email:{
            type:String,
            required: true,
            unique: true
        },
        password:{
            type:String,
            required: true,
            minlength: 8
        },
        intentos:{
            type: Number,
            default: 3
        },
        role:{
            type:["user","admin","guest"],
            default:"user"
        },
        estadoValidacion:{
            type:["Validado","noValidado"],
            default:"noValidado"
        },
        codigoValidacion:{
            type:String
        },
        codigoVerificacion:{
            type:String
        },
        nombre:{
            type:String
        },
        nif:{
            type:String
        },
        apellido:{
            type:String
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company'
        },
        mediaId: {
            type: mongoose.Types.ObjectId, // Estructura (string) especial de mongo
            ref: 'storages'
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true, // createdAt, updatedAt
        versionKey: false
    }
)

// users es el nombre de la colección en mongoDB (o de la tabla en SQL)
module.exports = mongoose.model("users", UserScheme);