const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { clientValidator } = require("../validator/clientValidator");

const {createClient,getClients,getClientById,updateClient,deleteClient,restoreClient, getArchivedClients} = require("../controllers/client");



/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para la gestión de clientes
 */

/**
 * @swagger
 * /client:
 *   post:
 *     summary: Crear un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Cliente S.A."
 *               nif:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Cliente ya registrado
 */
router.post("/", authMiddleware, clientValidator, handleValidator, createClient);

/**
 * @swagger
 * /client:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes del usuario o compañía
 */
router.get("/", authMiddleware, getClients);

/**
 * @swagger
 * /client/archivados:
 *   get:
 *     summary: Obtener lista de clientes archivados
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get("/archivados", authMiddleware, getArchivedClients);

/**
 * @swagger
 * /client/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", authMiddleware, getClientById);

/**
 * @swagger
 * /client/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.put("/:id", authMiddleware, clientValidator, handleValidator, updateClient);

/**
 * @swagger
 * /client/{id}:
 *   delete:
 *     summary: Eliminar cliente (soft o hard delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Si se omite o es true, se hace soft delete
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *       404:
 *         description: Cliente no encontrado
 */
router.delete("/:id", authMiddleware, deleteClient);

/**
 * @swagger
 * /client/restaurar/{id}:
 *   patch:
 *     summary: Restaurar cliente archivado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente archivado
 *     responses:
 *       200:
 *         description: Cliente restaurado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.patch("/restaurar/:id", authMiddleware, restoreClient);


module.exports = router;
