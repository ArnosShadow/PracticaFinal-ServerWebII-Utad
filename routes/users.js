const express= require("express");
const { actualizarItem, incluirItem, obtenerDatos, obtenerDato, eliminarDato, recuperarCuenta, invitar,enviarPeticion, confirmarPeticion } = require("../controllers/users");
const { authMiddleware } = require("../utils/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /register:
 *   put:
 *     summary: Actualiza datos personales del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, nombre, apellido, nif]
 *             properties:
 *               email:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               nif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       500:
 *         description: Error al actualizar
 */
router.put('/register', authMiddleware, actualizarItem);

/**
 * @swagger
 * /company:
 *   patch:
 *     summary: Añadir datos de empresa al usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *               esAutonomo:
 *                 type: boolean
 *               company:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   cif:
 *                     type: string
 *                   direccion:
 *                     type: string
 *                   provincia:
 *                     type: string
 *                   pais:
 *                     type: string
 *     responses:
 *       200:
 *         description: Datos de empresa incluidos correctamente
 */
router.patch('/company', authMiddleware, incluirItem);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', authMiddleware, obtenerDatos);

/**
 * @swagger
 * /{email}:
 *   get:
 *     summary: Obtener un usuario por email
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:email', authMiddleware, obtenerDato);

/**
 * @swagger
 * /{email}:
 *   delete:
 *     summary: Eliminar un usuario (soft o hard delete)
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete('/:email', authMiddleware, eliminarDato);

/**
 * @swagger
 * /recoverAccount/{email}:
 *   put:
 *     summary: Recuperar cuenta eliminada de un usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta recuperada correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/recoverAccount/:email', authMiddleware, recuperarCuenta);

/**
 * @swagger
 * /invite:
 *   post:
 *     summary: Invitar a un usuario a una compañía
 *     tags: [Usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, company]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               company:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   cif:
 *                     type: string
 *                   direccion:
 *                     type: string
 *                   provincia:
 *                     type: string
 *                   pais:
 *                     type: string
 *     responses:
 *       201:
 *         description: Usuario invitado correctamente
 *       409:
 *         description: Usuario ya existe
 *       404:
 *         description: Compañía no encontrada
 */
router.post('/invite', invitar);

/**
 * @swagger
 * /recuperar/peticion/{email}:
 *   post:
 *     summary: Solicitar código para restaurar contraseña
 *     tags: [Usuario]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Código enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/recuperar/peticion/:email', enviarPeticion);

/**
 * @swagger
 * /recuperar/confirmar:
 *   post:
 *     summary: Confirmar código de recuperación y actualizar contraseña
 *     tags: [Usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, codigo, nuevaContraseña]
 *             properties:
 *               email:
 *                 type: string
 *               codigo:
 *                 type: string
 *               nuevaContraseña:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Código inválido o usuario no encontrado
 */
router.post('/recuperar/confirmar', confirmarPeticion);

module.exports = router;
