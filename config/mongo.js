// config/mongo.js
const mongoose = require("mongoose");

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) return;

  const DB_URI = process.env.DB_URI;
  try {
    await mongoose.connect(DB_URI);
    console.log("Conexión exitosa a MongoDB");
    isConnected = true;
  } catch (err) {
    console.error("Error al conectar a MongoDB", err);
    throw err;
  }
};

module.exports = dbConnect; // 👈 ESTA LÍNEA ES LA QUE FALTABA
