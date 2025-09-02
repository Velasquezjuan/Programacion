const express = require('express');
const router = express.Router();
const gestionController = require('../controllers/gestion.controller');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', gestionController.getUsuarios);

module.exports = router;
