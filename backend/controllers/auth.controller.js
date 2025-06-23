const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const users = []; // Almacenamiento temporal local

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, rol } = req.body;

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'El usuario ya existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, rol }); //  Ahora también guarda el rol
  res.json({ message: 'Usuario registrado correctamente' });
};

// LOGIN DE USUARIO
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  //  En el token también enviamos el rol
  const token = jwt.sign({ username: user.username, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });

  res.json({
    message: 'Login exitoso',
    token,
    username: user.username,
    rol: user.rol
  });
};

// protecccion de rutas
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });

    req.userId = decoded.username;
    req.userRol = decoded.rol;
    next();
  });
}