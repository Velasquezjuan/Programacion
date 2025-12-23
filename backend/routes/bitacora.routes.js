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
const bitacoraController = require('../controllers/bitacora.controller');

router.get('/dashboard', bitacoraController.getDashboardData);
router.get('/reporte', bitacoraController.generarReporte);
router.get('/dashboard/exportar', bitacoraController.exportarDashboard);
router.get('/reporte/exportar', bitacoraController.exportarReporte);
module.exports = router;