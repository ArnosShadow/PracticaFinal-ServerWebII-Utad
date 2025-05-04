const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { deliveryNoteValidator } = require("../validator/deliverynotesValidator");

const {createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, updateDeliveryNote, deleteDeliveryNote, restoreDeliveryNote} = require("../controllers/deliveryNotes");



router.post("/",authMiddleware, deliveryNoteValidator, handleValidator, createDeliveryNote);
router.get("/", authMiddleware, getDeliveryNotes);
router.get("/:id", authMiddleware, getDeliveryNoteById);
router.put("/:id", authMiddleware,deliveryNoteValidator, handleValidator,  updateDeliveryNote);
router.delete("/:id", deleteDeliveryNote);
router.patch("/restaurar/:id", restoreDeliveryNote);
module.exports = router;
