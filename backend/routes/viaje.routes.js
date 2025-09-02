const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viaje.controller');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', viajeController.getViajes);
router.post('/solicitar', viajeController.createViaje);
router.put('/:id_viaje/estado', viajeController.updateEstadoViaje);
router.get('/bitacora/:patente', viajeController.getBitacoraByVehiculo);

module.exports = router;
