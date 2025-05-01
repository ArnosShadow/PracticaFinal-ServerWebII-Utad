const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { clientValidator } = require("../validator/clientValidator");

const {createClient,getClients,getClientById,updateClient,deleteClient,restoreClient, getArchivedClients} = require("../controllers/client");



router.post("/",authMiddleware, clientValidator, handleValidator, createClient);
router.get("/",authMiddleware, getClients);
router.get("/archivados", getArchivedClients);
router.get("/:id",authMiddleware, getClientById);
router.put("/:id",authMiddleware, clientValidator, handleValidator, updateClient);
router.delete("/:id",authMiddleware, deleteClient);
router.patch("/restaurar/:id",authMiddleware, restoreClient);

module.exports = router;
