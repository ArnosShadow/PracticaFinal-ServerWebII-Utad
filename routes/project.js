const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { projectValidator } = require("../validator/projectValidator");
const {createProject, getProjectById, getProjects, updateProject, deleteProject,restoreProject,getArchivedProject} = require("../controllers/project");


/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Endpoints para la gestión de proyectos
 */

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Crear un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, clientId]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Instalación eléctrica"
 *               descripcion:
 *                 type: string
 *               clientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Proyecto ya existe
 */
router.post("/", authMiddleware, projectValidator, handleValidator, createProject);

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Listar todos los proyectos
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos disponibles
 */
router.get("/", authMiddleware, getProjects);
/**
 * @swagger
 * /project/archivados:
 *   get:
 *     summary: Obtener proyectos archivados
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get("/archivados", authMiddleware, getArchivedProject);

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get("/:id", authMiddleware, getProjectById);

/**
 * @swagger
 * /project/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               clientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.put("/:id", projectValidator, handleValidator, updateProject);

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (soft o hard delete)
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Proyecto eliminado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete("/:id", authMiddleware, deleteProject);

/**
 * @swagger
 * /project/{id}:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto restaurado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.patch("/restaurar/:id", authMiddleware, restoreProject);



module.exports = router;
