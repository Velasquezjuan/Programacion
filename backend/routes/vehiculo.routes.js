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
const { body, validationResult } = require('express-validator');
const vehiculoController = require('../controllers/vehiculo.controller');
const verifyToken = require('../middleware/verifyToken');

// --- Middleware para validar los datos de un vehículo nuevo ---
const validateVehiculo = [
  body('patente').isLength({ min: 6, max: 8 }).withMessage('La patente debe ser válida.'),
  body('marca').notEmpty().withMessage('La marca es obligatoria.'),
  body('modelo').notEmpty().withMessage('El modelo es obligatorio.'),
  body('ano').isInt({ min: 2015 }).withMessage('El año no es válido.'),
  body('tipo_vehiculo').isInt({ min: 1 }).withMessage('El tipo de vehículo es obligatorio.'),
  body('capacidad').isBoolean().withMessage('El campo de capacidad no es válido.'),
  
  body('nombre_conductor').notEmpty().withMessage('El nombre del conductor es obligatorio.'),
  body('conductor_reemplazo').notEmpty().withMessage('El nombre del conductor de reemplazo es obligatorio'),
  body('rut_proveedor').notEmpty().withMessage('El RUT del encargado es obligatorio.'),
  body('id_contrato').notEmpty().withMessage('El número de contrato es obligatorio.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
  body('fecha_inicio').isISO8601().withMessage('La fecha de inicio del contrato no es válida.'),
  body ('fecha_termino').isISO8601().withMessage('La fecha de término del contrato no es válida.'),
  body ('permiso_circulacion').isISO8601().withMessage('La fecha de permiso de circulación no es válida.'),
  body ('seguro_obligatorio').isISO8601().withMessage('La fecha de seguro obligatorio no es válida.'),
  body ('horas_contratadas').isInt({ min: 1, max: 44 }).withMessage('Las horas contratadas deben ser entre 1 y 168 horas semanales.'),
];

router.get('/', verifyToken, vehiculoController.getVehiculos);
router.post('/registro-vehiculo', verifyToken, validateVehiculo, vehiculoController.createVehiculo);
router.get('/por-programa/:id_programa', verifyToken, vehiculoController.getVehiculosPorPrograma);
router.get('/tipos-por-programa/:id_programa', verifyToken, vehiculoController.getTiposVehiculoPorPrograma);
router.get('/programas-por-vehiculo/:patente', verifyToken, vehiculoController.getProgramasPorVehiculo);
router.get('/programa/:id_programa/tipos', verifyToken, vehiculoController.getTiposVehiculoPorPrograma);
router.get('/:patente/programas', verifyToken, vehiculoController.getProgramasPorVehiculo);
router.get('/masivos', verifyToken, vehiculoController.getVehiculosMasivos);
module.exports = router;
