const express = require("express")
const cors = require("cors")
const dbConnect = require('./config/mongo')
require("dotenv").config();
const morganBody = require("morgan-body");
const router = require("./routes");
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")
const loggerStream = require("./utils/handleLogger");



const app = express();

// Middleware para errores enviados a Slack
morganBody(app, {
    noColors: true,
    skip: (req, res) => res.statusCode < 400,
    stream: loggerStream
});


//Le decimos a la app de express() que use cors para evitar errores Cross-Domain.
app.use(cors());
app.use(express.json());
//app.use("./routes", router);


app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
)
app.use("/api", require("./routes"))

module.exports = app;