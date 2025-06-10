const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,    // 👈 agregado aquí
  actualizarEstadoReserva,
  eliminarReserva
} = require("../controllers/reservas.controller");

const { verificarToken } = require("../middlewares/verificarToken");

// Rutas de reservas
router.post("/", crearReserva);
router.get("/", verificarToken, obtenerReservas); // solo admin
router.get("/:id", verificarToken, obtenerReservaPorId);
router.put("/:id", verificarToken, actualizarEstadoReserva);
router.delete("/:id", verificarToken, eliminarReserva);

// Ruta para obtener fechas ocupadas de una habitación
router.get("/fechas-ocupadas", async (req, res) => {
  const { habitacionId } = req.query;

  if (!habitacionId) {
    return res.status(400).json({ error: "habitacionId es requerido" });
  }

  try {
    const reservahabitaciones = await prisma.reservahabitacion.findMany({
      where: {
        habitacionId: parseInt(habitacionId)
      },
      include: {
        reserva: {
          select: {
            fechaEntrada: true,
            fechaSalida: true
          }
        }
      }
    });

    // Retornamos solo las fechas de las reservas
    const fechasOcupadas = reservahabitaciones.map(rh => rh.reserva);

    res.json(fechasOcupadas);

  } catch (error) {
    console.error("❌ Error en fechas ocupadas:", error);
    res.status(500).json({ error: "No se pudieron obtener las fechas" });
  }
});

module.exports = router;
