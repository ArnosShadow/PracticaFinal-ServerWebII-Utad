const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { projectValidator } = require("../validator/project");
const {createProject, getProjectById, getProjects} = require("../controllers/project");


router.post("/", authMiddleware, projectValidator, handleValidator, createProject);
router.get("/",authMiddleware, getProjects);
router.get("/:id",authMiddleware, getProjectById);


module.exports = router;
