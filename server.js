const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Configuración de CORS para que no te bloquee Vercel
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ Conexión a MongoDB (Prioriza la variable de Render)
const mongoURI = process.env.MONGO_URI || "mongodb+srv://axeluniversidad:AXEL2005@ac-j1ok0ko.1s967ts.mongodb.net/ecoguardian?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("🔥 MongoDB conectado"))
  .catch(err => console.log("❌ Error Mongo:", err));

// ✅ RUTAS AJUSTADAS A TUS ARCHIVOS ACTUALES
// Usamos los nombres exactos que vi en tu captura de pantalla
const authRoutes = require("./routes/authroutes");
const cardRoutes = require("./routes/cardRouthes"); // Aquí incluí la 'h' y la 'R' de tu archivo

app.use("/api/auth", authRoutes);
app.use("/api/card", cardRoutes);

app.get("/", (req, res) => res.send("Servidor funcionando 🚀"));

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Puerto ${PORT}`);
});
