const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router(); 

// --- REGISTRO DE USUARIO ---
exports.register = async (req, res) => {
  try {
    const { rut_usuario,
  nombre,
  apellido_paterno,
  apellido_materno,
  correo,
  contrasena,
  rol,
  area,
  centro,
  establecimiento,
} = req.body;


 let establecimientoIdFinal;
    const centroId = parseInt(centro, 10);

    if (centroId === 1) { 
      establecimientoIdFinal = 1; 
    } else {
      establecimientoIdFinal = establecimiento;
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaHasheada = await bcrypt.hash(contrasena, salt);

    const query = `INSERT INTO USUARIO (
    rut_usuario,
    nombre,
    apellido_paterno,
    apellido_materno,
    correo,
    contrasena,
    rol,
    area,
    ESTABLECIMIENTO_idEstablecimiento
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
    
    
 await db.query(query, [
  rut_usuario,
  nombre,
  apellido_paterno,
  apellido_materno,
  correo,
  contrasenaHasheada,
  rol,
  area,
  establecimientoIdFinal
    ]);

    res.status(201).json({ message: 'Usuario registrado con éxito.' });

  } catch (error) {
    console.error('Error en el registro:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El correo o RUT ya está en uso.' });
    }
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- LOGIN DE USUARIO ---
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const [rows] = await db.query('SELECT * FROM USUARIO WHERE correo = ?', [correo]);

    const usuario = rows[0];
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const esContrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esContrasenaCorrecta) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    
    const payload = {
      rut: usuario.rut_usuario,
      rol: usuario.rol
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d' 
    });

    res.status(200).json({
      message: 'Login exitoso',
      token: token, 
      usuario: {
        rut_usuario: usuario.rut_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
