const db = require('../db');

// --- OBTENER TODOS LOS VEHÍCULOS ---
exports.getVehiculos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VEHICULO');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- CREAR UN NUEVO VEHÍCULO ---
exports.createVehiculo = async (req, res) => {
  try {
    const { patente, marca, modelo, ano, tipo_vehiculo, capacidad, revision_tecnica, nombre_conductor } = req.body;

    const query = `
      INSERT INTO VEHICULO 
      (patente, 
      marca, modelo, 
      ano, tipo_vehiculo, 
      capacidad, revision_tecnica, 
      nombre_conductor) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [patente, 
      marca, modelo, 
      ano, tipo_vehiculo, 
      capacidad, revision_tecnica, 
      nombre_conductor]);

    res.status(201).json({ message: 'Vehículo registrado con éxito.' });

  } catch (error) {
    console.error('Error al registrar vehículo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'La patente del vehículo ya está registrada.' });
    }
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
