const express = require("express");
const router = express.Router();
const promocionController = require("../controllers/promocion.controller");

router.post("/", promocionController.crearPromocion);
router.delete("/:id", promocionController.eliminarPromocion);
router.put("/:id", promocionController.actualizarPromocion);

module.exports = router;
