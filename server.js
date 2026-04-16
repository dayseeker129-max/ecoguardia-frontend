const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ CONEXIÓN CORRECTA A MONGODB ATLAS
mongoose.connect("mongodb://axeluniversidad:AXEL2005@ac-j1ok0ko-shard-00-00.1s967ts.mongodb.net:27017,ac-j1ok0ko-shard-00-01.1s967ts.mongodb.net:27017,ac-j1ok0ko-shard-00-02.1s967ts.mongodb.net:27017/ecoguardian?ssl=true&replicaSet=atlas-119onz-shard-0&authSource=admin&retryWrites=true&w=majority")
  .then(() => console.log("🔥 MongoDB conectado"))
  .catch(err => console.log("❌ Error Mongo:", err));

// RUTAS
const authRoutes = require("./routes/authroutes");
const cardRoutes = require("./routes/cardroutes");

app.use("/api/auth", authRoutes);
app.use("/api/card", cardRoutes);

// TEST
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// SERVER
app.listen(5000, () => {
  console.log("🚀 Puerto 5000");
});
