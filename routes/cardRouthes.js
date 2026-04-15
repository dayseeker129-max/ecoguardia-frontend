const express = require("express");
const router = express.Router();
const Card = require("../models/card");

// GUARDAR TARJETA
router.post("/add", async (req, res) => {
  try {
    const { userId, number, name, expiry } = req.body;

    const card = new Card({ userId, number, name, expiry });
    await card.save();

    res.json({ message: "Tarjeta guardada" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al guardar tarjeta" });
  }
});

// OBTENER TARJETAS
router.get("/:userId", async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.params.userId });
    res.json(cards);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al obtener tarjetas" });
  }
});

module.exports = router;