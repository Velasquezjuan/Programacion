const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viaje.controller');
const verifyToken = require('../middleware/verifyToken');
const { body,  } = require('express-validator');

//-- Middleware para validar los datos de una solicitud de viaje ---

const validateViaje = [
    
    body( 'fecha_viaje').notEmpty().withMessage('La fecha del viaje es obligatoria.'),
    body ('hora_inicio').notEmpty().withMessage('La hora de inicio es obligatoria.'),
    body ('punto_salida').notEmpty().withMessage('el punto de salida del viaje es obligatoria.'),
    body ('punto_destino').notEmpty().withMessage('el punto de destino del viaje es obligatoria.'),
    body ('motivo').notEmpty().withMessage('el motivo del viaje es obligatorio.'),
    body ('ocupantes').notEmpty().withMessage('los ocupantes del viaje es obligatorio.'),
    body ('responsable').notEmpty().withMessage('el responsable del viaje es obligatorio.'),
    body ('necesita_carga').isBoolean().withMessage('el campo necesita carga debe ser booleano.'),
    body ('vehiculo_deseado').notEmpty().withMessage('el tipo de vehiculo deseado es obligatorio.'),
    body ('programa'),
];

/* const validateViajeMasivo = [
    
    body( 'fecha_viaje').notEmpty().withMessage('La fecha del viaje es obligatoria.'),
    body ('hora_inicio').notEmpty().withMessage('La hora de inicio es obligatoria.'),
    body ('punto_salida').notEmpty().withMessage('el punto de salida del viaje es obligatoria.'),
    body ('punto_destino').notEmpty().withMessage('el punto de destino del viaje es obligatoria.'),
    body ('motivo').notEmpty().withMessage('el motivo del viaje es obligatorio.'),
    body ('ocupantes').notEmpty().withMessage('los ocupantes del viaje es obligatorio.'),
    body ('responsable').notEmpty().withMessage('el responsable del viaje es obligatorio.'),
    body ('necesita_carga').isBoolean().withMessage('el campo necesita carga debe ser booleano.'),
    body ('vehiculo_deseado').notEmpty().withMessage('el tipo de vehiculo deseado es obligatorio.'),
    body ('programa'),
];*/

router.use(verifyToken);

router.get('/', viajeController.getViajes);
router.post('/solicitar', validateViaje, viajeController.createViaje);
router.post('/masivo', viajeController.createViajeMasivo);
router.put('/:id_viaje', viajeController.updateEstadoViaje);
router.get('/bitacora/:patente', viajeController.getBitacoraByVehiculo);
router.get('/usuario/:nombre', viajeController.getViajesPorUsuario);
router.get('/masivos', viajeController.getViajesMasivos);

module.exports = router;
