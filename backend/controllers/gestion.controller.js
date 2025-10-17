const e = require('express');
const db = require('../db');

// --- OBTENER TODOS LOS USUARIOS ---
exports.getUsuarios = async (req, res) => {
  try {
    const query = `
       SELECT 
        u.rut_usuario as rut, 
        u.nombre, 
        u.apellido_paterno, 
        u.correo, 
        u.rol, 
        u.activo, 
        u.area,
        e.nombre_establecimiento as establecimiento
      FROM USUARIO u
      LEFT JOIN ESTABLECIMIENTO e ON u.ESTABLECIMIENTO_idEstablecimiento = e.idEstablecimiento;
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    const { nombre, rol, activo } = req.body;

   
    let query = 'UPDATE USUARIO SET ';
    const params = [];
    if (nombre !== undefined) { query += 'nombre = ?, '; params.push(nombre); }
    if (rol !== undefined) { query += 'rol = ?, '; params.push(rol); }
    if (activo !== undefined) { query += 'activo = ?, '; params.push(activo); }
     if (params.length === 0) {
      return res.status(200).json({ message: 'Nada que actualizar.' });
    }
    query = query.slice(0, -2);
    query += ' WHERE rut_usuario = ?';
    params.push(rut);

    await db.query(query, params);
    res.status(200).json({ message: 'Usuario actualizado con éxito.' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- OBTENER VEHICULOS CON CONDUCTORES ---
exports.getVehiculosConConductores = async ( req, res ) => {
  try {
    const  query = `
      SELECT 
        v.patente, v.marca, v.modelo, v.ano, v.capacidad, v.revision_tecnica,
        v.nombre_conductor, v.nombre_conductor_reemplazo,
        tv.tipo_vehiculo,
        c.id_contrato, c.rut_proveedor, c.nombre_proveedor, c.fecha_inicio, c.fecha_termino
      FROM VEHICULO v
      JOIN TIPO_VEHICULO tv ON v.TIPO_VEHICULO_id_tipoVehiculo = tv.id_tipoVehiculo 
      JOIN CONTRATO c ON v.patente = c.VEHICULO_patente;
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener vehículos con conductores:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- GESTIÓN DE VEHÍCULOS ---

exports.getVehiculosConDetalles = async (req, res) => {
  try {
    const query = `
     SELECT 
        v.patente, v.marca, v.modelo, v.ano, v.capacidad, v.revision_tecnica,
        v.nombre_conductor, v.nombre_conductor_reemplazo, v.activo,
        v.necesita_reemplazo, 
        v.patente_reemplazo, 
        v.justificacion_reemplazo, 
        v.revision_tecnica_reemplazo, 
        v.autorizacion_reemplazo, 
        v.fecha_reemplazo,
        tv.nombre_tipoVehiculo as tipoVehiculo,
        c.nombre_proveedor as responsable
      FROM VEHICULO v
      LEFT JOIN TIPO_VEHICULO tv ON v.TIPO_VEHICULO_id_tipoVehiculo = tv.id_tipoVehiculo 
      LEFT JOIN CONTRATO c ON v.patente = c.VEHICULO_patente;
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener vehículos con detalles:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.updateVehiculo = async (req, res) => {
  try {
    const { patente } = req.params;
    const fields = req.body; 
  if (fields.fecha_reemplazo) {
      fields.fecha_reemplazo = new Date(fields.fecha_reemplazo).toISOString().split('T')[0];
    }
    if (fields.revision_tecnica_reemplazo) {
      fields.revision_tecnica_reemplazo = new Date(fields.revision_tecnica_reemplazo).toISOString().split('T')[0];
    }

    let query = 'UPDATE VEHICULO SET ';
    const params = [];
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        query += `${key} = ?, `;
        params.push(fields[key]);
      }
    }
    
    if (params.length === 0) {
      return res.status(200).json({ message: 'Nada que actualizar.' });
    }

    query = query.slice(0, -2);
    query += ' WHERE patente = ?';
    params.push(patente);

    await db.query(query, params);
    res.status(200).json({ message: 'Vehículo actualizado con éxito.' });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}