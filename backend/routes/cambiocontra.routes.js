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
const cambiocontraController = require('../controllers/cambiocontra.controller');



router.post('/solicitar-reseteo', cambiocontraController.solicitarReseteo);
router.get('/verificar-token/:token', cambiocontraController.verificarToken);
router.post('/resetear-contrasena', cambiocontraController.resetearContrasena);
module.exports = router;