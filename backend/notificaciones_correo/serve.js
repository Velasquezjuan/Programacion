const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DEL TRANSPORTADOR DE CORREO ---
const transporter = nodemailer.createTransport({
  service: 'gmail', // Servicio de correo (gmail, hotmail, etc.)
  auth: {
    user: 'testapicorreomov@gmail.com', 
    pass: 'Api1234@', 
  },
});

// --- EL ENDPOINT PRINCIPAL DE LA API ---
// Tu app Ionic hará peticiones a esta ruta: http://localhost:3000/enviar-correo
app.post('/enviar-correo', (req, res) => {
  console.log('Petición recibida:', req.body);

  const { destinatario, asunto, cuerpoHtml } = req.body;

  // Validamos que tengamos toda la información necesaria
  if (!destinatario || !asunto || !cuerpoHtml) {
    return res.status(400).json({ error: 'Faltan datos para enviar el correo.' });
  }

  const mailOptions = {
    from: '"Nombre de tu App" <tu-correo@gmail.com>', // El remitente que verá el usuario
    to: destinatario,
    subject: asunto,
    html: cuerpoHtml, // Usamos HTML para que los correos se vean más bonitos
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ error: 'Ocurrió un error al enviar el correo.' });
    }
    console.log('Correo enviado:', info.response);
    res.status(200).json({ message: 'Correo enviado con éxito.' });
  });
});

app.listen(port, () => {
  console.log(`Servidor de notificaciones escuchando en http://localhost:${port}`);
});
