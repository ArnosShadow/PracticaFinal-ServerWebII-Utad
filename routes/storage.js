const express= require("express");
const {createItem, validateItem, loginItem} = require("../controllers/auth");
const { validationResult } = require("../validator/auth");
const { authMiddleware } = require("../utils/authMiddleware");
const { loginValidator } = require("../validator/loginValidator");
const router = express.Router();

/**
 * @swagger
 * /registro:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error de validación o usuario existente
 */
router.post("/registro", validationResult, createItem);

/**
 * @swagger
 * /validacion:
 *   post:
 *     summary: Validar código de verificación de cuenta
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario validado correctamente
 *       400:
 *         description: Código inválido o error de validación
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/validacion", authMiddleware, validateItem);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/login'
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente
 *       400:
 *         description: Credenciales incorrectas
 */
router.post("/login", loginValidator, loginItem);

/**
 * @swagger
 * /storage/local:
 *   patch:
 *     summary: Subir una imagen local al servidor
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *     responses:
 *       200:
 *         description: Imagen subida correctamente
 *       400:
 *         description: Imagen demasiado grande o error al procesar archivo
 */

/**
 * @swagger
 * /storage:
 *   patch:
 *     summary: Subir una imagen a IPFS (nube)
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *     responses:
 *       200:
 *         description: Imagen subida a IPFS correctamente
 *       400:
 *         description: Imagen demasiado grande o error al procesar archivo
 */

module.exports = router;