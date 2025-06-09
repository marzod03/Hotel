const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { verificarToken } = require("../middlewares/verificarToken");

router.post("/habitacion", verificarToken, upload.single("imagen"), (req, res) => {
  try {
    return res.status(200).json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Error al subir imagen", error });
  }
});

module.exports = router;
