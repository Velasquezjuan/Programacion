/**
 * ============================================================================
 * PROYECTO: GECOVI (Gestión de Control de Viajes)
 * DESARROLLADO POR: Juan Velasquez
 * FECHA DE CREACIÓN: 2024-2025
 * ============================================================================
 * Este código es propiedad intelectual de Juan Velasquez.
 * Prohibida su distribución o copia sin autorización.
 * Lo hice para mi examen de titulo y que si me salio CTM AJAJ
 * ============================================================================
 */
const db = require('../db');

// --- FUNCION AUXILIAR PARA CONTROLAR LOS VEHICULOS ASIGNADOS A VIAJES ---
async function verificarDisponibilidad(patente, fecha, horaInicio, horaFin, idViajeIgnorar = null) {
    // revisamos la tabla viaje y viaje masivo para ver si el vehiculo esta ocupado
      let queryNormal = `
        SELECT id_viaje FROM VIAJE 
        WHERE vehiculo_patente = ? 
        AND fecha_viaje = ? 
        AND estado IN ('aprobado', 'en_curso', 'finalizado', 'Agendado', 'agendado') 
        AND (hora_inicio < ? AND hora_fin > ?)
    `;
    
    const paramsNormal = [patente, fecha, horaFin, horaInicio];

    // Si estamos editando un viaje, no debemos contar el mismo viaje como conflicto
    if (idViajeIgnorar) {
        queryNormal += ` AND id_viaje != ?`;
        paramsNormal.push(idViajeIgnorar);
    }

    const [normales] = await db.query(queryNormal, paramsNormal);
    if (normales.length > 0) return false; // vehiculo ocupado en viajes nomales ojo solo los normales

    // revisamos la tala de viajes masivos
    let queryMasivo = `
        SELECT id_viaje FROM VIAJE_MASIVO 
        WHERE vehiculo_patente = ? 
        AND fecha_viaje = ? 
        AND estado IN ('aprobado', 'en_curso', 'finalizado', 'pendiente')
        AND (hora_inicio < ? AND hora_fin > ?)
    `;
    
    const paramsMasivo = [patente, fecha, horaFin, horaInicio];
    
    // opcion para ignorar los viajes editados
    if (idViajeIgnorar) {
        queryMasivo += ` AND id_viaje != ?`;
        paramsMasivo.push(idViajeIgnorar);
    }

    const [masivos] = await db.query(queryMasivo, paramsMasivo);
    if (masivos.length > 0) return false; // vehiculo ocupado solo en  viajes masivos ojo solo viajes masivos

    return true;
}

// --- VERIFICAR DISPONIBILIDAD DE UN VEHÍCULO PARA UN VIAJE ---
exports.verificarDisponibilidadVehiculo = async (req, res) => {
    try {
        const { patente, fecha_viaje, hora_inicio, hora_fin, id_viaje } = req.body;
        const disponible = await verificarDisponibilidad(patente, fecha_viaje, hora_inicio, hora_fin, id_viaje || null);
        res.status(200).json({ disponible });
    } catch (error) {
        console.error('Error al verificar disponibilidad del vehículo:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- OBTENER TODOS LOS VIAJES ---
exports.getViajes = async (req, res) => {
try {

    const { rol, idEstablecimiento, rut } = req.user; // Datos del token
    const rolesAdmin = ['adminSistema'];
    const esAdmin = rolesAdmin.includes(rol);

    let query = `
        SELECT 
        v.*, v.id_viaje as id,
        solicitante.nombre as nombre_solicitante, solicitante.apellido_paterno as apellido_solicitante, solicitante.correo as correo_solicitante,
        veh.patente as patente_vehiculo,
        prog.nombre_programa,
        COALESCE(tv_asignado.nombre_tipoVehiculo, tv_deseado.nombre_tipoVehiculo) as tipoVehiculo,
        veh.nombre_conductor as nombreConductor,
        'normal' as tipo_origen,
        solicitante.ESTABLECIMIENTO_idEstablecimiento
      FROM VIAJE v
      JOIN USUARIO solicitante ON v.solicitante_rut_usuario = solicitante.rut_usuario
      LEFT JOIN PROGRAMA prog ON v.PROGRAMA_id_programa = prog.id_programa
      LEFT JOIN VEHICULO veh ON v.vehiculo_patente = veh.patente
      LEFT JOIN TIPO_VEHICULO tv_asignado ON veh.TIPO_VEHICULO_id_tipoVehiculo = tv_asignado.id_tipoVehiculo
      LEFT JOIN TIPO_VEHICULO tv_deseado ON v.vehiculo_deseado = tv_deseado.id_tipoVehiculo
      WHERE 1=1
    `;
    const params = [];

    if (!esAdmin) {
        if (idEstablecimiento) {
             query += ` AND solicitante.ESTABLECIMIENTO_idEstablecimiento = ?`;
             params.push(idEstablecimiento);
        } else {             
             query += ` AND v.solicitante_rut_usuario = ?`;
             params.push(rut);
        }
    }

    query += ` ORDER BY v.fecha_solicitud DESC`;

    const [rows] = await db.query(query, params);
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
      fecha_viaje, hora_inicio, hora_fin, punto_salida, punto_destino,
      motivo, ocupantes, programa, responsable, necesita_carga, vehiculo_deseado
    } = req.body;


    const solicitante_rut = req.user.rut;

    if (!solicitante_rut) {
        return res.status(403).json({ message: 'No se pudo identificar al solicitante desde el token.' });
    }

    const query = `
      INSERT INTO VIAJE (
        fecha_viaje, hora_inicio, hora_fin, punto_salida, punto_destino,
        motivo, ocupantes, PROGRAMA_id_programa, solicitante_rut_usuario, responsable, necesita_carga, vehiculo_deseado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const [result] = await db.query(query, [
      fecha_viaje, hora_inicio, hora_fin , punto_salida, punto_destino,
      motivo, ocupantes, programa, solicitante_rut, responsable, necesita_carga, vehiculo_deseado
    ]);

 const nuevoViajeId = result.insertId;

    const selectQuery = `
      SELECT 
        v.*,
        u.nombre as nombre_solicitante,
        u.correo as correo_solicitante,
        COALESCE(
          tv_asignado.nombre_tipoVehiculo,
          tv_deseado.nombre_tipoVehiculo
        ) as tipoVehiculo
      FROM VIAJE v
      JOIN USUARIO u ON v.solicitante_rut_usuario = u.rut_usuario
      LEFT JOIN VEHICULO veh ON v.vehiculo_patente = veh.patente
      LEFT JOIN TIPO_VEHICULO tv_asignado ON veh.TIPO_VEHICULO_id_tipoVehiculo = tv_asignado.id_tipoVehiculo
      LEFT JOIN TIPO_VEHICULO tv_deseado ON v.vehiculo_deseado = tv_deseado.id_tipoVehiculo
      WHERE v.id_viaje = ?
    `;

    const [viajesCreados] = await db.query(selectQuery, [nuevoViajeId]);
    
    if (viajesCreados.length === 0) {
      return res.status(404).json({ message: 'No se pudo encontrar el viaje recién creado.' });
    }
    const viajeCompleto = viajesCreados[0];

    res.status(201).json({ 
      message: 'Viaje solicitado con éxito.',
      viaje: viajeCompleto 
    });

  } catch (error) {
    console.error('Error al crear el viaje:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- ACTUALIZAR ESTADO DE UN VIAJE ---
exports.updateEstadoViaje = async (req, res) => {
    try {
        const { id_viaje } = req.params;
        const { estado, motivo_rechazo, motivo_reagendamiento, vehiculo_patente, fecha_viaje,
           hora_inicio, justificativo_no_realizado, motivo_rechazoReagendamiento } = req.body;

           if (estado === 'aprobado' || estado === 'Agendado' || (estado === 'pendiente' && vehiculo_patente)) {
            
            // Recuperamos datos actuales de la DB por si no vienen en el body
            let fechaCheck = fecha_viaje;
            let horaInicioCheck = hora_inicio;
            let horaFinCheck = null; 

            const [viajeActual] = await db.query('SELECT * FROM VIAJE WHERE id_viaje = ?', [id_viaje]);
            if (!viajeActual.length) return res.status(404).json({ message: 'Viaje no encontrado' });

            // Rellenamos datos faltantes con lo que ya existe en la DB
            fechaCheck = fechaCheck || viajeActual[0].fecha_viaje;
            horaInicioCheck = horaInicioCheck || viajeActual[0].hora_inicio;
            horaFinCheck = viajeActual[0].hora_fin; 
            const patenteCheck = vehiculo_patente || viajeActual[0].vehiculo_patente;

            // Validamos si hay patente para chequear
            if (patenteCheck) {
                const disponible = await verificarDisponibilidad(
                    patenteCheck, 
                    fechaCheck, 
                    horaInicioCheck, 
                    horaFinCheck, 
                    id_viaje 
                );

                if (!disponible) {
                    return res.status(409).json({ 
                        message: 'CONFLICTO: El vehículo seleccionado ya está ocupado en ese horario.' 
                    });
                }
            }
        }

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
        if (fecha_viaje) {
            query += ', fecha_viaje = ?';
            params.push(fecha_viaje);
        }
        if (hora_inicio) {
            query += ', hora_inicio = ?';
            params.push(hora_inicio);
        }

        if (justificativo_no_realizado) {
        query += ', justificativo_no_realizado = ?';
        params.push(justificativo_no_realizado);
       }

       if (motivo_rechazoReagendamiento) {
        query += ', motivo_rechazoReagendamiento = ?';
        params.push(motivo_rechazoReagendamiento);
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

exports.getViajesPorUsuario = async (req, res) => {
    try {
        const { nombre } = req.params;
        if (!nombre) {
            return res.status(403).json({ message: 'No se pudo identificar al usuario desde el token.' });
        }
        const query= `
       SELECT 
        v.*,
        u.nombre as nombre_solicitante, 
        u.apellido_paterno as apellido_solicitante,
        COALESCE(tv_asignado.nombre_tipoVehiculo, tv_deseado.nombre_tipoVehiculo ) as tipoVehiculo
      FROM VIAJE v
      JOIN USUARIO u ON v.solicitante_rut_usuario = u.rut_usuario
      LEFT JOIN VEHICULO veh ON v.vehiculo_patente = veh.patente
      LEFT JOIN TIPO_VEHICULO tv_asignado ON veh.TIPO_VEHICULO_id_tipoVehiculo = tv_asignado.id_tipoVehiculo
      LEFT JOIN TIPO_VEHICULO tv_deseado ON v.vehiculo_deseado = tv_deseado.id_tipoVehiculo
      WHERE u.nombre = ? 
      ORDER BY v.fecha_viaje DESC, v.hora_inicio DESC`; 

        const [rows] = await db.query(query, [nombre]);
         res.status(200).json(rows);

  } catch (error) {
    console.error('Error al obtener los viajes por usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.createViajeMasivo = async (req, res) => {

  try {
    const {
      fecha_viaje, hora_inicio, hora_fin, punto_salida, punto_destino, 
      vehiculo_patente, motivo, ocupantes, programa, responsable, 
       vehiculo_deseado, estado
    } = req.body;


    const solicitante_rut = req.user.rut;

    if (!solicitante_rut) {
        return res.status(403).json({ message: 'No se pudo identificar al solicitante desde el token.' });
    }
    // Verificar disponibilidad del vehículo si se asigna uno
    if (vehiculo_patente) {
        const disponible = await verificarDisponibilidad(vehiculo_patente, fecha_viaje, hora_inicio, hora_fin);
        
        if (!disponible) {
            return res.status(409).json({ 
                message: 'CONFLICTO: El vehículo ya tiene un viaje asignado que choca con este horario.' 
            });
        }
    }

    const query = `
      INSERT INTO VIAJE_MASIVO (
        fecha_viaje, hora_inicio, hora_fin, punto_salida, punto_destino,vehiculo_patente,
        motivo, ocupantes, PROGRAMA_id_programa, solicitante_rut_usuario, responsable, vehiculo_deseado, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const [result] = await db.query(query, [
      fecha_viaje, hora_inicio, hora_fin, punto_salida, punto_destino,vehiculo_patente,
      motivo, ocupantes, programa, solicitante_rut, responsable,  vehiculo_deseado, estado 
    ]);

 const nuevoViajeId = result.insertId;

    const selectQuery = `
      SELECT 
        v.*,
        u.nombre as nombre_solicitante,
        u.correo as correo_solicitante,
        COALESCE(
          tv_asignado.nombre_tipoVehiculo,
          tv_deseado.nombre_tipoVehiculo
        ) as tipoVehiculo
      FROM VIAJE_MASIVO v
      JOIN USUARIO u ON v.solicitante_rut_usuario = u.rut_usuario
      LEFT JOIN VEHICULO veh ON v.vehiculo_patente = veh.patente
      LEFT JOIN TIPO_VEHICULO tv_asignado ON veh.TIPO_VEHICULO_id_tipoVehiculo = tv_asignado.id_tipoVehiculo
      LEFT JOIN TIPO_VEHICULO tv_deseado ON v.vehiculo_deseado = tv_deseado.id_tipoVehiculo
      WHERE v.id_viaje = ?
    `;

    const [viajesCreados] = await db.query(selectQuery, [nuevoViajeId]);
    
    if (viajesCreados.length === 0) {
      return res.status(404).json({ message: 'No se pudo encontrar el viaje recién creado.' });
    }
    const viajeCompleto = viajesCreados[0];

    res.status(201).json({ 
      message: 'Viaje solicitado con éxito.',
      viaje: viajeCompleto 
    });

  } catch (error) {
    console.error('Error al crear el viaje:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.getViajesMasivos = async (req, res) => {
  try {
    const { rol, idEstablecimiento, rut } = req.user; // Datos del token
    const rolesAdmin = ['adminSistema'];
    const esAdmin = rolesAdmin.includes(rol);

    let query = `
      SELECT 
        vm.*, vm.id_viaje as id,
        solicitante.nombre as nombre_solicitante, 
        solicitante.apellido_paterno as apellido_solicitante, 
        solicitante.correo as correo_solicitante,
        veh.patente as patente_vehiculo,
        prog.nombre_programa,
        COALESCE(tv_asignado.nombre_tipoVehiculo, 
        tv_deseado.nombre_tipoVehiculo) as tipoVehiculo,
        veh.nombre_conductor as nombreConductor,
        'masivo' as tipo_origen,
        solicitante.ESTABLECIMIENTO_idEstablecimiento
      FROM VIAJE_MASIVO vm
      JOIN USUARIO solicitante ON vm.solicitante_rut_usuario = solicitante.rut_usuario
      LEFT JOIN PROGRAMA prog ON vm.PROGRAMA_id_programa = prog.id_programa
      LEFT JOIN VEHICULO veh ON vm.vehiculo_patente = veh.patente
      LEFT JOIN TIPO_VEHICULO tv_asignado ON veh.TIPO_VEHICULO_id_tipoVehiculo = tv_asignado.id_tipoVehiculo
      LEFT JOIN TIPO_VEHICULO tv_deseado ON vm.vehiculo_deseado = tv_deseado.id_tipoVehiculo
      WHERE 1=1  
    `;

   const params = [];

    if (!esAdmin) {
        if (idEstablecimiento) {
             query += ` AND solicitante.ESTABLECIMIENTO_idEstablecimiento = ?`;
             params.push(idEstablecimiento);
        } else { 
             query += ` AND vm.solicitante_rut_usuario = ?`;
             params.push(rut);
        }
    }

    query += ` ORDER BY vm.fecha_viaje DESC, vm.hora_inicio DESC`;

  const [rows] = await db.query(query, params);
    res.status(200).json(rows);
    
  } catch (error) {
    console.error('Error al obtener viajes masivos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
