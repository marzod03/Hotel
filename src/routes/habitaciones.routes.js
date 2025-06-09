const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  crearHabitacion,
  obtenerHabitaciones,
  actualizarHabitacion,
  eliminarHabitacion
} = require("../controllers/habitaciones.controller");
const { verificarToken } = require("../middlewares/verificarToken");

router.get("/disponibilidad", async (req, res) => {
  try {
    const habitaciones = await prisma.habitacion.findMany();

    const disponibilidad = habitaciones.reduce((acc, h) => {
      const tipo = h.tipoHabitacion ? h.tipoHabitacion.toLowerCase() : "sin_tipo";
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    res.json(disponibilidad);
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    res.status(500).json({ error: "Error al calcular disponibilidad" });
  }
});
router.get("/fechas-ocupadas", async (req, res) => {
  const { fechaEntrada, fechaSalida } = req.query;

  if (!fechaEntrada || !fechaSalida) {
    return res.status(400).json({ error: "Se requieren fechaEntrada y fechaSalida" });
  }

  try {
    const reservas = await prisma.ReservaHabitacion.findMany({
      where: {
        reserva: {
          fechaEntrada: { lt: new Date(fechaSalida) },
          fechaSalida: { gt: new Date(fechaEntrada) },
        },
      },
      select: {
        habitacionId: true,
      },
    });

    const ocupadas = reservas.map(r => r.habitacionId);

    res.json({ ocupadas });
  } catch (error) {
    console.error("Error al obtener fechas ocupadas:", error);
    res.status(500).json({ error: "Error al obtener fechas ocupadas" });
  }
});


router.get("/", obtenerHabitaciones);
router.post("/", verificarToken, crearHabitacion);
router.put("/:id", verificarToken, actualizarHabitacion);
router.delete("/:id", verificarToken, eliminarHabitacion);

module.exports = router;
