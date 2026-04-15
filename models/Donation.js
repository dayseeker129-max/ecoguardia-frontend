const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema({
  // Relación con el usuario que hizo la donación
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Cambiamos 'monto' a 'amount' para que coincida con tu React
  amount: {
    type: Number,
    required: true
  },
  // Agregamos el proyecto para saber a dónde va el dinero
  proyectoId: {
    type: String,
    required: true,
    enum: ["oceanos", "bosques", "fauna"] // Esto asegura que solo entren estos 3
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", DonationSchema);