const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // 👈 FALTABA ESTO

const {
  crearReserva,
  obtenerReservas,
  actualizarEstadoReserva,
  eliminarReserva
} = require("../controllers/reservas.controller");

const { verificarToken } = require("../middlewares/verificarToken");

router.post("/", crearReserva);
router.get("/", verificarToken, obtenerReservas); // solo admin
router.put("/:id", verificarToken, actualizarEstadoReserva);
router.delete("/:id", verificarToken, eliminarReserva);

router.get("/fechas-ocupadas", async (req, res) => {
  const { habitacionId } = req.query;

  if (!habitacionId) {
    return res.status(400).json({ error: "habitacionId es requerido" });
  }

  try {
    const reservas = await prisma.reserva.findMany({
      where: {
        habitacionId: parseInt(habitacionId)
      },
      select: {
        fechaEntrada: true,
        fechaSalida: true
      }
    });

    res.json(reservas);
  } catch (error) {
    console.error("❌ Error en fechas ocupadas:", error);
    res.status(500).json({ error: "No se pudieron obtener las fechas" });
  }
});

router.get("/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        habitaciones: {
          include: { habitacion: true }
        }
      }
    });

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la reserva" });
  }
});



module.exports = router;
