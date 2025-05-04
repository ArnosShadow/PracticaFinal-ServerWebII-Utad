const mongoose = require("mongoose");

const HorasSchema = new mongoose.Schema({
  descripcion: { 
    type: String, 
    required: true 
  },
  horas: { 
    type: Number, 
    required: true 
  },
  trabajador: { 
    type: String, 
    required: true }
}, { _id: false });

const MaterialesSchema = new mongoose.Schema({
  descripcion: { 
    type: String, 
    required: true 
  },
  cantidad: { 
    type: Number, 
    required: true 
  },
  unidad: { 
    type: String, 
    required: true 
  }
}, { _id: false });

const DeliveryNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true
    },
    horas: [HorasSchema],
    materiales: [MaterialesSchema],
    observaciones: {
      type: String
    },
    firmado: {
      type: Boolean,
      default: false
    },
    firmaUrl: {
      type: String
    },
    pdfUrl: {
      type: String
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

module.exports = mongoose.model("deliverynotes", DeliveryNoteSchema);
