const User = require("../models/user");
const bcrypt = require("bcrypt");

// REGISTRO
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Campos vacíos" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "Usuario registrado correctamente" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al registrar" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Campos vacíos" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso" });

  } catch (error) {
    res.status(500).json({ error: "Error en login" });
  }
};