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
  body('ano').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('El año no es válido.'),
  body('capacidad').isInt({ min: 1 }).withMessage('La capacidad debe ser un número mayor a 0.'),
  body('revision_tecnica').isISO8601().withMessage('La fecha de revisión técnica no es válida.'),
  body('nombre_conductor').notEmpty().withMessage('El nombre del conductor es obligatorio'),
  body('nombre_conductor_reemplazo').notEmpty().withMessage('El nombre del conductor de reemplazo es obligatorio'),
  body('TIPO_VEHICULO_id_tipoVehiculo').isInt().withMessage('El tipo de vehículo es obligatorio.'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];


router.get('/', verifyToken, vehiculoController.getVehiculos);

router.post('/registro-vehiculo', verifyToken, validateVehiculo, vehiculoController.createVehiculo);

module.exports = router;
