// controllers/admin.controller.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

exports.registrarAdmin = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const existe = await prisma.administrador.findUnique({ where: { correo } });
    if (existe) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.administrador.create({
      data: { nombre, correo, password: hash },
    });

    res.status(201).json({ message: "Administrador creado correctamente." });
  } catch (error) {
    console.error("Error en registrarAdmin:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios." });
    }

    const admin = await prisma.administrador.findUnique({ where: { correo } });
    if (!admin) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    const token = jwt.sign(
      { id: admin.id, correo: admin.correo, nombre: admin.nombre },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, nombre: admin.nombre });
  } catch (error) {
    console.error("Error en loginAdmin:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
