const mongoose = require("mongoose");
const CompanySchema = new mongoose.Schema(
{
    nombre:{
        type: String
    },
    cif:{
        type: String
    },
    direccion:{
        type:String
    },
    provincia:{
        type:String
    },
    pais:{
        type:String
    }
},
{
    timestamps: true, // createdAt, updatedAt
    versionKey: false
}
);


module.exports = mongoose.model("company", CompanySchema);