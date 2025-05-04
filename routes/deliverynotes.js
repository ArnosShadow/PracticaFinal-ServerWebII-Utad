const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { deliveryNoteValidator } = require("../validator/deliverynotesValidator");

const {createDeliveryNote, getDeliveryNotes, getDeliveryNoteById} = require("../controllers/deliveryNotes");



router.post("/",authMiddleware, deliveryNoteValidator, handleValidator, createDeliveryNote);
router.get("/", authMiddleware, getDeliveryNotes);
router.get("/:id", getDeliveryNoteById);

module.exports = router;
