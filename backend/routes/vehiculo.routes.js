const express = require('express');
const router = express.Router();
const controller = require('../controllers/vehiculo.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, controller.getVehiculos);

module.exports = router;