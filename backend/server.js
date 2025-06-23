require('dotenv').config();
const express = require('express');
const cors = require('cors');


const vehiculoRoutes = require('./routes/vehiculo.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
