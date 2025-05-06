const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { projectValidator } = require("../validator/projectValidator");
const {
  createProject,
  getProjectById,
  getProjects,
  updateProject,
  deleteProject,
  restoreProject,
  getArchivedProject
} = require("../controllers/project");

/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Endpoints para la gestión de proyectos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Proyecto:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         clientId:
 *           type: string
 *         userId:
 *           type: string
 *         companyId:
 *           type: string
 *         archivado:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *             required: [nombre, clientId]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Instalación eléctrica"
 *               descripcion:
 *                 type: string
 *                 example: "Reforma en la planta 2"
 *               clientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proyecto'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 proyecto:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Proyecto'
 *       404:
 *         description: No hay proyectos encontrados
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
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
 *       - in: path
 *         name: id
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
 * /project/restaurar/{id}:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *                 deleted:
 *                   type: boolean
 *       404:
 *         description: Proyecto no encontrado
 */
router.patch("/restaurar/:id", authMiddleware, restoreProject);

module.exports = router;
