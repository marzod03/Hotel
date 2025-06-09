const express = require("express");
const router = express.Router();
const { registrarAdmin, loginAdmin } = require("../controllers/admin.controller");

router.post("/register", registrarAdmin);
router.post("/login", loginAdmin);

module.exports = router;
