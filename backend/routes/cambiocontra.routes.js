const express = require('express');
const router = express.Router();
const cambiocontraController = require('../controllers/cambiocontra.controller');



router.post('/solicitar-reseteo', cambiocontraController.solicitarReseteo);
router.get('/verificar-token/:token', cambiocontraController.verificarToken);
router.post('/resetear-contrasena', cambiocontraController.resetearContrasena);
module.exports = router;