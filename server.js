// server.js
const app = require("./app");
const dbConnect = require("./config/mongo");

const port = process.env.PORT || 3001;

dbConnect().then(() => {
  app.listen(port, () => {
    console.log("Servidor escuchando por el puerto " + port);
  });
});
