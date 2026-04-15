const express = require("express");
const router = express.Router();
// Si aún no tienes listo el middleware de auth, puedes comentarlo temporalmente
const auth = require("../middleware/auth"); 

const Donation = require("../models/Donation");

router.post("/donate", auth, async (req, res) => {
  try {
    // 1. Cambiamos 'monto' por 'amount' y agregamos 'proyectoId'
    // Esto debe coincidir con lo que envías desde el fetch en React
    const { amount, proyectoId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Monto inválido" });
    }

    // 2. Creamos la donación vinculada al usuario autenticado
    const donation = new Donation({
      user: req.user.id, // Viene del middleware 'auth'
      amount: amount,
      proyectoId: proyectoId || "General", // Por si no eligen uno específico
      fecha: new Date()
    });

    await donation.save();

    res.json({ 
      success: true, 
      msg: "¡Donación registrada en la base de datos!",
      donation 
    });

  } catch (error) {
    console.error("Error en Donación:", error);
    res.status(500).json({ msg: "Error al procesar el pago en el servidor" });
  }
});

module.exports = router;