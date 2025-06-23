const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// registro de usuarios (POST /api/auth/register)
router.post(
  '/register',
  [
    body('username').isLength({ min: 4 }).withMessage('Usuario ≥ 4 caracteres'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña ≥ 6 caracteres'),
    body('rol')
      .notEmpty().withMessage('El rol es obligatorio')
      .isIn(['adminSistema','its','solicitante','coordinador','conductor'])
      .withMessage('Rol no válido')
  ],
  authController.register
);

// login de usuarios (POST /api/auth/login)
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('El usuario es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  authController.login
);

module.exports = router;
