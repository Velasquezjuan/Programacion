const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacora.controller');

router.get('/dashboard', bitacoraController.getDashboardData);
router.get('/reporte', bitacoraController.generarReporte);
router.get('/dashboard/exportar', bitacoraController.exportarDashboard);
router.get('/reporte/exportar', bitacoraController.exportarReporte);
module.exports = router;