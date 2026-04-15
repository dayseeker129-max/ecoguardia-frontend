const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  userId: String,
  number: String,
  name: String,
  expiry: String
});

module.exports = mongoose.model("Card", CardSchema);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");