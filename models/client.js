const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    nif: { type: String },
    direccion: { type: String },
    email: { type: String },
    telefono: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company"
    },
    archivado: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, 
    versionKey: false
  }
);

module.exports = mongoose.model("clients", ClientSchema);
