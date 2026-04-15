const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Importamos el modelo de usuario
const User = require("../models/user");

// Esta clave debería ir idealmente en un archivo .env
const SECRET = "ecoGuardianSecret";

// --- RUTA DE REGISTRO ---
router.post("/register", async (req, res) => {
  try {
    // Recibimos 'name', 'email' y 'pass' (como lo envía tu React)
    const { name, email, pass } = req.body;

    // 1. Validar que no falten datos
    if (!name || !email || !pass) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }

    // 2. Revisar si el usuario ya existe
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ msg: "Este correo ya está registrado" });
    }

    // 3. Encriptar la contraseña (usamos 'pass' que viene del front)
    const hash = await bcrypt.hash(pass, 10);

    // 4. Crear y guardar el nuevo usuario
    const user = new User({ 
      name, 
      email, 
      password: hash // Se guarda como 'password' en la DB
    });
    
    await user.save();

    // 5. Responder con éxito y los datos del usuario (sin la clave)
    res.status(201).json({ 
      msg: "Usuario registrado con éxito",
      user: { name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error("Error en Registro:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
});

// --- RUTA DE LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { email, pass } = req.body;

    // 1. Buscar al usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }

    // 2. Comparar contraseñas
    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    // 3. Generar el Token JWT
    const token = jwt.sign(
      { id: user._id },
      SECRET,
      { expiresIn: "2h" }
    );

    // 4. Enviar respuesta con el nombre para el Avatar de React
    res.json({ 
      token, 
      user: { 
        name: user.name, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error("Error en Login:", error);
    res.status(500).json({ msg: "Error al intentar entrar" });
  }
});

module.exports = router;