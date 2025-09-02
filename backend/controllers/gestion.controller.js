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
