/**
 * ============================================================================
 * PROYECTO: GECOVI (Gestión de Control de Viajes)
 * DESARROLLADO POR: Juan Velasquez
 * FECHA DE CREACIÓN: 2024-2025
 * ============================================================================
 * Este código es propiedad intelectual de Juan Velasquez.
 * Prohibida su distribución o copia sin autorización.
 * Lo hice para mi examen de titulo y que si me salio CTM AJAJ
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const gestionController = require('../controllers/gestion.controller');
const verifyToken = require('../middleware/verifyToken');
const { body } = require('express-validator');





router.use(verifyToken);

router.get('/', gestionController.getUsuarios);
router.get('/usuarios', gestionController.getUsuarios);
router.put('/usuarios/:rut', gestionController.updateUsuario);
router.put('/usuarios/:rut/desbloquear', gestionController.desbloquearUsuario);
router.get('/vehiculos', gestionController.getVehiculosConDetalles);
router.put('/vehiculos/:patente', gestionController.updateVehiculo);
router.get('/establecimientos', gestionController.getEstablecimientos);


module.exports = router;
