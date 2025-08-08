require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); 

// Tus rutas existentes
const vehiculoRoutes = require('./routes/vehiculo.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/auth', authRoutes);


// --- Lógica de Notificaciones por Correo ---

const transporter = nodemailer.createTransport({
  service: 'gmail',              
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

app.post('/enviar-notificacion', (req, res) => {
  console.log('Petición recibida en /enviar-notificacion');

  const { destinatario, asunto, cuerpoHtml } = req.body;

  if (!destinatario || !asunto || !cuerpoHtml) {
    console.error('Error: Faltan datos en la petición.');
    return res.status(400).json({ error: 'Faltan datos (destinatario, asunto, cuerpoHtml).' });
  }

  const mailOptions = {
    from: `"CmpaMov" <${process.env.EMAIL_USER}>`, 
    to: destinatario,
    subject: asunto,
    html: cuerpoHtml,
  };

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
  console.log(` Servidor completo corriendo en puerto ${PORT}`);
});
