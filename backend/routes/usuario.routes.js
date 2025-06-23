const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.post('/registro', [
    body('rut')
      .matches(/^[0-9]+-[0-9kK]$/).withMessage('RUT inválido. Ej: 12345678-9'),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('apellidoPaterno').notEmpty().withMessage('Apellido paterno es requerido'),
    body('apellidoMaterno').notEmpty().withMessage('Apellido materno es requerido'),
    body('correo').isEmail().withMessage('Correo electrónico no válido'),
    body('cargo').notEmpty().withMessage('Cargo es requerido')
  ], (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
  
    console.log('✅ Usuario recibido y validado:', req.body);
    res.status(201).json({ mensaje: 'Usuario registrado correctamente (modo local)' });
  });
  
  module.exports = router;