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
const crypto = require('crypto'); 
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.solicitarReseteo = async (req, res) => {
  try {
    const { rut } = req.body;
    const [usuarios] = await db.query('SELECT * FROM USUARIO WHERE rut_usuario = ?', [rut]);

    if (usuarios.length === 0) {
      // Respondemos con éxito para no revelar si un RUT existe o no
      return res.status(200).json({ message: 'Si el RUT es válido, se enviará un correo.' });
    }
    
    const usuario = usuarios[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3600000); // 1 hora de expiración

    await db.query('UPDATE USUARIO SET reset_token = ?, reset_token_expira = ? WHERE rut_usuario = ?', [token, expira, rut]);

    const resetLink = `http://localhost:8100/nueva-contrasena?token=${token}`; // Cambiar por la URL real del frontend  http://172.30.0.9:3000/ la ruta tambien puede cambiar segun lo que nos entregen

    const mailOptions = {
      from: `"GEMOVIL" <${process.env.EMAIL_USER}>`,
      to: usuario.correo,
      subject: 'Recuperación de Contraseña - GEMOVIL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          
          <div style="background-color: #3880ff; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Solicitud de Recuperación de Contraseña</h1>
          </div>

          <div style="padding: 20px; line-height: 1.6; color: #333;">
            <p style="font-size: 1.1em;">¡Hola!</p>
            
             <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            
            <div style="text-align:center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #3880ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Restablecer Contraseña</a>
            </div>
            
            <p style="font-size: 0.9em; color: #666;">⚠️ Por seguridad, este enlace expirará en 20 minutos.</p>
           <p>Si no solicitaste esto, por favor ignora este correo.</p>
          </div>

          <div style="background-color: #f4f4f4; color: #555; padding: 10px; text-align: center; font-size: 0.8em;">
            <p style="margin: 0;">Este es un correo generado automáticamente por la aplicación Gemovil by jv.</p>
          </div>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Si el RUT es válido, se enviará un correo.' });

  } catch (error) {
    console.error('Error al solicitar reseteo:', error);
    res.status(500).json({ message: 'Error interno.' });
  }
};

exports.verificarToken = async (req, res) => {
  try {
    const { token } = req.params;
    const [usuarios] = await db.query('SELECT * FROM USUARIO WHERE reset_token = ? AND reset_token_expira > NOW()', [token]);

    if (usuarios.length === 0) {
      return res.status(404).json({ message: 'Token inválido o expirado.' });
    }
    res.status(200).json({ message: 'Token válido.' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno.' });
  }
};

exports.resetearContrasena = async (req, res) => {
  try {
    const { token, contrasena } = req.body;
    
    if (!token || !contrasena) {
      return res.status(400).json({ message: 'Faltan datos.' });
    }

    const [usuarios] = await db.query('SELECT * FROM USUARIO WHERE reset_token = ? AND reset_token_expira > NOW()', [token]);

    if (usuarios.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const usuario = usuarios[0];
    const nuevaContrasenaHash = await bcrypt.hash(contrasena, 10);

    await db.query(
      "UPDATE USUARIO SET contrasena = ?, reset_token = NULL, reset_token_expira = NULL, bloqueado = 'no', intentos_fallidos = 0 WHERE rut_usuario = ?",
      [nuevaContrasenaHash, usuario.rut_usuario]
    );

    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ message: 'Error interno.' });
  }
};