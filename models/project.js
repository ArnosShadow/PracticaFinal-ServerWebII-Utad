const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true
    },
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

module.exports = mongoose.model("projects", ProjectSchema);
