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
  let connection;
  try {
    connection = await db.getConnection();
  } catch (error) {
    console.error('Error al obtener conexión:', error);
    return res.status(500).json({ message: 'Error de conexión con la base de datos.' });
  }

  try {
    await connection.beginTransaction();

    const {
      patente, marca, modelo, ano, capacidad, tipo_vehiculo, revision_tecnica,
      nombre_conductor, conductor_reemplazo, rut_proveedor, nombre_proveedor,
      id_contrato, programa, centro, centroSalud1, centroSalud2, centroEducacion, centroAtm
    } = req.body;

    const capacidadInt = capacidad ? 1 : 0;

    const sqlVehiculo = `
      INSERT INTO VEHICULO (
        patente, marca, modelo, ano, capacidad, revision_tecnica,
        nombre_conductor, nombre_conductor_reemplazo, TIPO_VEHICULO_id_tipoVehiculo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    await connection.query(sqlVehiculo, [
      patente, marca, modelo, ano, capacidadInt, revision_tecnica,
      nombre_conductor, conductor_reemplazo, tipo_vehiculo
    ]);

    const sqlContrato = `
      INSERT INTO CONTRATO (
        id_contrato, rut_proveedor, nombre_proveedor, 
        fecha_inicio, fecha_termino, VEHICULO_patente
      ) VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), ?);
    `;
    await connection.query(sqlContrato, [
      id_contrato, rut_proveedor, nombre_proveedor, patente
    ]);

    if (programa && programa.length > 0) {
      const sqlVehiculoPrograma = 'INSERT INTO VEHICULO_has_PROGRAMA (VEHICULO_patente, PROGRAMA_id_programa) VALUES ?';
      const valoresVehiculoPrograma = programa.map(idPrograma => [patente, idPrograma]);
      await connection.query(sqlVehiculoPrograma, [valoresVehiculoPrograma]);
    }

    const todosLosEstablecimientos = [centro, centroSalud1, centroSalud2, centroEducacion, centroAtm].filter(id => id);
    if (todosLosEstablecimientos.length > 0) {
        const sqlVehiculoEstablecimiento = 'INSERT INTO VEHICULO_has_ESTABLECIMIENTO (VEHICULO_patente, ESTABLECIMIENTO_idEstablecimiento) VALUES ?';
        const valoresVehiculoEstablecimiento = todosLosEstablecimientos.map(idEst => [patente, idEst]);
        await connection.query(sqlVehiculoEstablecimiento, [valoresVehiculoEstablecimiento]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Vehículo y asociaciones registrados con éxito.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error en la transacción de registro de vehículo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'La patente o el número de contrato ya están registrados.' });
    }
    res.status(500).json({ message: 'Error interno del servidor al registrar.', error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
// --- OBTENER VEHÍCULOS CON CONDUCTORES ASIGNADOS ---
exports.getVehiculos = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.patente as id,
        v.patente,
        v.capacidad,
        tv.nombre_tipoVehiculo as tipoVehiculo,
        v.nombre_conductor as nombreConductor 
      FROM VEHICULO v
      LEFT JOIN TIPO_VEHICULO tv ON v.TIPO_VEHICULO_id_tipoVehiculo = tv.id_tipoVehiculo;
    `;

    const [vehiculos] = await db.query(query);
    res.status(200).json(vehiculos);

  } catch (error) {
    console.error('Error al obtener los vehículos con conductor:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};