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

exports.getCentros = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CENTRO ORDER BY nombre_centro');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener centros:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
