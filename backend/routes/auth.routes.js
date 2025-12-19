const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller'); // Importamos el controlador

// --- Middleware para validar los datos de entrada del registro ---
const validateUser = [
  body('rut_usuario').notEmpty().withMessage('El RUT es obligatorio.'),
  body('nombre').notEmpty().withMessage('El nombre es obligatorio.'),
  body('apellido_paterno').notEmpty().withMessage('El apellido paterno es obligatorio.'),
  body('apellido_materno').notEmpty().withMessage('El apellido materno es obligatorio.'),
  body('correo').isEmail().withMessage('El correo debe ser un email válido.'),
  //body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('rol').notEmpty().withMessage('El rol es obligatorio.'),
  body('area').notEmpty().withMessage('El área es obligatoria.'),
  body('centro').isInt({ min: 1 }).withMessage('Debe seleccionar un centro válido.'),
  body('establecimiento').if(body('centro').equals('2'))
    .isInt({ min: 1 }).withMessage('Debe seleccionar un establecimiento de Salud válido.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];


router.post('/registro-usuario', validateUser, authController.register);
router.post('/login', authController.login);
router.get('/usuarios', authController.getTodosLosUsuarios);
router.post('/buscar-por-rut', authController.buscarUsuarioPorRut);
module.exports = router;