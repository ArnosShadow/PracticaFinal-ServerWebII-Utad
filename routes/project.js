const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { projectValidator } = require("../validator/project");
const {createProject} = require("../controllers/project");


router.post("/", authMiddleware, projectValidator, handleValidator, createProject);


module.exports = router;
