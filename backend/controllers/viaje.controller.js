const db = require('../db');

// --- OBTENER TODOS LOS VIAJES ---
exports.getViajes = async (req, res) => {
try {
    const query = `
      SELECT 
        v.id_viaje as id,
        v.*, 
        solicitante.nombre as nombre_solicitante,
        solicitante.apellido_paterno as apellido_solicitante,
        veh.patente as patente_vehiculo,
        prog.nombre_programa
      FROM VIAJE v
      JOIN USUARIO solicitante ON v.solicitante_rut_usuario = solicitante.rut_usuario
      LEFT JOIN VEHICULO veh ON v.vehiculo_patente = veh.patente
      LEFT JOIN PROGRAMA prog ON v.PROGRAMA_id_programa = prog.id_programa
      ORDER BY v.fecha_solicitud DESC;
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- CREAR UN NUEVO VIAJE ---
exports.createViaje = async (req, res) => {
  try {
    const {
      fecha_viaje, hora_inicio, punto_salida, punto_destino,
      motivo, ocupantes, programa, solicitante_rut
    } = req.body;

    const query = `
      INSERT INTO VIAJE (
        fecha_viaje, hora_inicio, punto_salida, punto_destino,
        motivo, ocupantes, PROGRAMA_id_programa, solicitante_rut_usuario, responsable_rut_usuario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    await db.query(query, [
      fecha_viaje, hora_inicio, punto_salida, punto_destino,
      motivo, ocupantes, programa, solicitante_rut, solicitante_rut // Por ahora, el solicitante es el responsable
    ]);
    res.status(201).json({ message: 'Viaje solicitado con éxito.' });
  } catch (error) {
    console.error('Error al crear el viaje:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- ACTUALIZAR ESTADO DE UN VIAJE ---
exports.updateEstadoViaje = async (req, res) => {
    try {
        const { id_viaje } = req.params;
        const { estado, motivo_rechazo, motivo_reagendamiento, vehiculo_patente } = req.body;

        let query = 'UPDATE VIAJE SET estado = ?';
        const params = [estado];

        if (motivo_rechazo) {
            query += ', motivo_rechazo = ?';
            params.push(motivo_rechazo);
        }
        if (motivo_reagendamiento) {
            query += ', motivo_reagendamiento = ?';
            params.push(motivo_reagendamiento);
        }
        if (vehiculo_patente) {
            query += ', vehiculo_patente = ?';
            params.push(vehiculo_patente);
        }
        
        query += ' WHERE id_viaje = ?';
        params.push(id_viaje);

        await db.query(query, params);
        res.status(200).json({ message: `Viaje ${estado} con éxito.` });

    } catch (error) {
        console.error('Error al actualizar estado del viaje:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- OBTENER BITÁCORA DE UN VEHÍCULO ---
exports.getBitacoraByVehiculo = async (req, res) => {
    try {
        const { patente } = req.params;
        const query = `
            SELECT * FROM VIAJE 
            WHERE vehiculo_patente = ? 
            ORDER BY fecha_viaje DESC;
        `;
        const [rows] = await db.query(query, [patente]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener la bitácora:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
