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
    console.error('Error al obtener conexión de la base de datos:', error);
    return res.status(500).json({ message: 'Error de conexión con la base de datos.' });
  }
  try {
    await connection.beginTransaction();
    // --- 1. INSERT EN LA TABLA VEHICULO ---
    const {patente,
        marca,
        modelo,
        ano,
        capacidad,
        revision_tecnica,
        nombre_conductor,
        nombre_conductor_reemplazo,
        TIPO_VEHICULO_id_tipoVehiculo
    } = req.body;

    const query = `
      INSERT INTO VEHICULO 
      (  patente
        marca,
        modelo,
        ano,
        capacidad,
        revision_tecnica,
        nombre_conductor,
        nombre_conductor_reemplazo,
        TIPO_VEHICULO_id_tipoVehiculo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ` ;

    await db.query(query, [patente,
        marca,
        modelo,
        ano,
        capacidad,
        revision_tecnica,
        nombre_conductor,
        nombre_conductor_reemplazo,
        TIPO_VEHICULO_id_tipoVehiculo]);
      
        // --- 2. INSERT EN LA TABLA CONTRATO ---

      const {
        rut_proveedor,
        nombre_proveedor,
        id_contrato
          } = req.body;
      

      const query2 = `
      INSERT INTO CONTRATO  
      ( rut_proveedor,
       nombre_proveedor,
       id_contrato
         )   VALUES ( ?, ?, ?)`;

      await db.query(query2, [rut_proveedor,
        nombre_proveedor,
        id_contrato]);

         // --- 3. INSERT EN LA TABLA CONECTORA VEHICULO_has_PROGRAMA ---
    const { programa } = req.body; 
    if (programa && programa.length > 0) {
      const sqlVehiculoPrograma = 'INSERT INTO VEHICULO_has_PROGRAMA (VEHICULO_patente, PROGRAMA_id_programa) VALUES ?';
      const valoresVehiculoPrograma = programa.map(idPrograma => [patente, idPrograma]);
      await connection.query(sqlVehiculoPrograma, [valoresVehiculoPrograma]);
    }

    // --- 4. INSERT EN LA TABLA CONECTORA VEHICULO_has_ESTABLECIMIENTO ---
    const {
      centro, 
      centroSalud1,
      centroSalud2,
      centroEducacion,
      centroAtm
    } = req.body;
    
    
    const todosLosEstablecimientos = [centro, centroSalud1, centroSalud2, centroEducacion, centroAtm].filter(id => id);
    
    if (todosLosEstablecimientos.length > 0) {
        const sqlVehiculoEstablecimiento = 'INSERT INTO VEHICULO_has_ESTABLECIMIENTO (VEHICULO_patente, ESTABLECIMIENTO_idEstablecimiento) VALUES ?';
        const valoresVehiculoEstablecimiento = todosLosEstablecimientos.map(idEst => [patente, idEst]);
        await connection.query(sqlVehiculoEstablecimiento, [valoresVehiculoEstablecimiento]);
    }

 
    await connection.commit();

    res.status(201).json({ message: 'Vehículo registrado con éxito.' });

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
