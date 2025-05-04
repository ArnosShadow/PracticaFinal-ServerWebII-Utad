const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { projectValidator } = require("../validator/project");
const {createProject, getProjectById, getProjects, updateProject, deleteProject,restoreProject} = require("../controllers/project");


router.post("/", authMiddleware, projectValidator, handleValidator, createProject);
router.get("/",authMiddleware, getProjects);
router.put("/:id", projectValidator, handleValidator, updateProject);
router.get("/:id",authMiddleware, getProjectById);
router.delete("/:id", authMiddleware, deleteProject);
router.delete("/:id", authMiddleware, restoreProject);


module.exports = router;
