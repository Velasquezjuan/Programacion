const express = require('express');
const router = express.Router();
const gestionController = require('../controllers/gestion.controller');
const verifyToken = require('../middleware/verifyToken');
const { body } = require('express-validator');





router.use(verifyToken);

router.get('/', gestionController.getUsuarios);
router.get('/usuarios', gestionController.getUsuarios);
router.put('/usuarios/:rut', gestionController.updateUsuario);
router.get('/vehiculos', gestionController.getVehiculosConDetalles);
router.put('/vehiculos/:patente', gestionController.updateVehiculo);

module.exports = router;
