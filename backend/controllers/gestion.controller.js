const db = require('../db');

// --- OBTENER TODOS LOS USUARIOS ---
exports.getUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT rut_usuario, nombre, apellido_paterno, correo, rol 
      FROM USUARIO;
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
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
}
