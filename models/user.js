const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Agregamos 'name' para que coincida con lo que pides en el Registro
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Evita que se registren dos veces con el mismo correo
  },
  password: { 
    type: String, 
    required: true 
  },
  fechaRegistro: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", UserSchema);