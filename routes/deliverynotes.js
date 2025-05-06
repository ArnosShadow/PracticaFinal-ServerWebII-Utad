const express = require("express");
const router = express.Router();

const authMiddleware = require("../utils/authMiddleware");
const handleValidator = require("../utils/handleValidator");
const { deliveryNoteValidator } = require("../validator/deliverynotesValidator");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });


const {createDeliveryNote, 
    getDeliveryNotes, 
    getDeliveryNoteById, 
    updateDeliveryNote, 
    deleteDeliveryNote, 
    restoreDeliveryNote, 
    getArchivedDeliveryNotes,
    firmarDeliveryNote, generarPDFDeliveryNote} = require("../controllers/deliveryNotes");



/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Endpoints para la gestión de albaranes
 */

/**
 * @swagger
 * /deliverynote:
 *   post:
 *     summary: Crear albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, projectId]
 *             properties:
 *               clientId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               horas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     trabajador:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     horas:
 *                       type: number
 *               materiales:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descripcion:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *                     unidad:
 *                       type: string
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 *       400:
 *         description: Error en la solicitud
 */
router.post("/", authMiddleware, deliveryNoteValidator, handleValidator, createDeliveryNote);

/**
 * @swagger
 * /deliverynote:
 *   get:
 *     summary: Listar todos los albaranes
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get("/", authMiddleware, getDeliveryNotes);

/**
 * @swagger
 * /deliverynote/archivados:
 *   get:
 *     summary: Listar albaranes archivados
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes archivados
 */
router.get("/archivados", authMiddleware, getArchivedDeliveryNotes);

/**
 * @swagger
 * /deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del albarán
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/:id", authMiddleware, getDeliveryNoteById);

/**
 * @swagger
 * /deliverynote/{id}:
 *   put:
 *     summary: Actualizar un albarán
 *     tags: [Albaranes]
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
 *               horas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     trabajador:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     horas:
 *                       type: number
 *               materiales:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descripcion:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *                     unidad:
 *                       type: string
 *     responses:
 *       200:
 *         description: Albarán actualizado
 *       404:
 *         description: Albarán no encontrado
 */
router.put("/:id", authMiddleware, deliveryNoteValidator, handleValidator, updateDeliveryNote);

/**
 * @swagger
 * /deliverynote/{id}:
 *   delete:
 *     summary: Eliminar albarán (solo si no está firmado)
 *     tags: [Albaranes]
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
 *         description: Albarán eliminado
 *       404:
 *         description: Albarán no encontrado
 */
router.delete("/:id", authMiddleware, deleteDeliveryNote);

/**
 * @swagger
 * /deliverynote/restaurar/{id}:
 *   patch:
 *     summary: Restaurar albarán archivado
 *     tags: [Albaranes]
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
 *         description: Albarán restaurado
 *       404:
 *         description: Albarán no encontrado
 */
router.patch("/restaurar/:id", authMiddleware, restoreDeliveryNote);


/**
 * @swagger
 * /deliverynote/firmar/{id}:
 *   post:
 *     summary: Firmar albarán con imagen (IPFS)
 *     tags: [Albaranes]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firma:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Firma subida correctamente
 *       404:
 *         description: Albarán no encontrado
 */
router.post("/firmar/:id", authMiddleware, upload.single("firma"), firmarDeliveryNote);
router.get("/pdf/:id", authMiddleware, generarPDFDeliveryNote);

module.exports = router;
