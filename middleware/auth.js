const jwt = require("jsonwebtoken");
const SECRET = "ecoGuardianSecret";

module.exports = (req, res, next) => {
  try {
    // 1. Obtener el token del header
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ msg: "No hay token, permiso denegado" });
    }

    // 🔥 AJUSTE: Si el token viene con la palabra "Bearer ", se la quitamos
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, SECRET);

    // 3. Guardar el payload en el request
    // Asegúrate de que en el Login guardaste el ID como { id: user._id }
    req.user = decoded; 

    next();
  } catch (err) {
    console.error("Error de autenticación:", err.message);
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};