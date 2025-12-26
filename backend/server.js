require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); 
const path = require('path'); // Necesario para manejar rutas de archivos estáticos

// Tus rutas existentes
const vehiculoRoutes = require('./routes/vehiculo.routes');
const authRoutes = require('./routes/auth.routes');
const viajeRoutes = require('./routes/viaje.routes'); 
const viajeController = require('./controllers/viaje.controller');
const bitacoraRoutes = require('./routes/bitacora.routes');
const cambiocontraRoutes = require('./routes/cambiocontra.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/gestion', require('./routes/gestion.routes'));
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/cambiocontra', cambiocontraRoutes);
app.use(express.static(path.join(__dirname, 'www'))); // Servir archivos estáticos desde la carpeta 'www'


// Manejar todas las demás rutas para servir el archivo index.html (para aplicaciones SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// --- Lógica de Notificaciones por Correo ---

const transporter = nodemailer.createTransport({
  service: 'gmail',              
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

app.post('/api/notificaciones', (req, res) => {
  console.log('Petición recibida en /api/notificaciones');

  const { destinatario, asunto, cuerpoHtml } = req.body;

  if (!destinatario || !asunto || !cuerpoHtml) {
    console.error('Error: Faltan datos en la petición.');
    return res.status(400).json({ error: 'Faltan datos (destinatario, asunto, cuerpoHtml).' });
  }

  const mailOptions = {
    from: `"GEMOVIL" <${process.env.EMAIL_USER}>`, 
    to: destinatario,
    subject: asunto,
    html: cuerpoHtml,
  };

  console.log('Enviando correo a:', destinatario);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ error: 'Ocurrió un error interno al enviar el correo.' });
    }
    
    console.log('Correo enviado con éxito:', info.response);
    res.status(200).json({ message: 'Notificación enviada con éxito.' });
  });
});


// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` ♫ Servidor completo corriendo en puerto ${PORT}`);
});
