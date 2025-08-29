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
  body('ano').isInt({ min: 1990 }).withMessage('El año no es válido.'),
  body('tipo_vehiculo').isInt({ min: 1 }).withMessage('El tipo de vehículo es obligatorio.'),
  body('capacidad').isBoolean().withMessage('El campo de capacidad no es válido.'),
  
  body('nombre_conductor').notEmpty().withMessage('El nombre del conductor es obligatorio.'),
  body('encargado_rut').notEmpty().withMessage('El RUT del encargado es obligatorio.'),
  body('contrato').notEmpty().withMessage('El número de contrato es obligatorio.'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];

router.get('/', verifyToken, vehiculoController.getVehiculos);
router.post('/registro-vehiculo', verifyToken, validateVehiculo, vehiculoController.createVehiculo);

module.exports = router;
