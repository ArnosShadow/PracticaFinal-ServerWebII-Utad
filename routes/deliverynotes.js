const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { deliveryNoteValidator } = require("../validator/deliverynotesValidator");

const {createDeliveryNote, getDeliveryNotes} = require("../controllers/deliveryNotes");



router.post("/",authMiddleware, deliveryNoteValidator, handleValidator, createDeliveryNote);
router.get("/", authMiddleware, getDeliveryNotes);

module.exports = router;
