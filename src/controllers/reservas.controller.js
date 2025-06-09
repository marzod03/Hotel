const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const enviarCorreo = require("../utils/sendgrid");

exports.crearReserva = async (req, res) => {
  console.log("📦 Body recibido:", req.body);

  const {
    huesped = {},
    fechaEntrada,
    fechaSalida,
    habitaciones = [],
  } = req.body;

  const {
    nombre = "",
    apellido = "",
    email = "",
    telefono = "",
  } = huesped;

  const nombreCliente = `${nombre} ${apellido}`.trim();

  try {
    if (!habitaciones.length) {
      return res.status(400).json({ message: "No se proporcionaron habitaciones." });
    }

    if (!nombreCliente || !email || !telefono || !fechaEntrada || !fechaSalida) {
      return res.status(400).json({ message: "Datos incompletos para crear la reserva." });
    }

    // Buscar o crear cliente
    let cliente = await prisma.cliente.findUnique({
      where: { email },
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre,
          apellido,
          email,
          telefono,
        },
      });
    }

    // Validar disponibilidad y preparar lista
    const habitacionesDisponibles = [];
    for (const h of habitaciones) {
      const habitacion = await prisma.habitacion.findUnique({
        where: { id: parseInt(h.id) },
      });

      if (!habitacion) {
        return res.status(404).json({ message: `Habitación con ID ${h.id} no encontrada.` });
      }

      const reservasExistentes = await prisma.ReservaHabitacion.findMany({
      where: {
        habitacionId: habitacion.id,
        reserva: {
          is: {
            fechaEntrada: { lt: new Date(fechaSalida) },
            fechaSalida: { gt: new Date(fechaEntrada) },
          },
        },
      },
      include: { reserva: true },
    });


      if (reservasExistentes.length > 0) {
        return res.status(400).json({
          message: `La habitación "${habitacion.nombre}" no está disponible para esas fechas.`,
        });
      }

      habitacionesDisponibles.push(habitacion);
    }

    // Crear reserva principal
    const nuevaReserva = await prisma.reserva.create({
      data: {
        cliente: { connect: { id: cliente.id } },
        fechaEntrada: new Date(fechaEntrada),
        fechaSalida: new Date(fechaSalida),
        status: "reservado",
        tipoHabitacion: habitacionesDisponibles.map(h => h.nombre).join(", "),
      },
    });

    // Asociar habitaciones a la reserva
    for (const habitacion of habitacionesDisponibles) {
      await prisma.ReservaHabitacion.create({
        data: {
          reservaId: nuevaReserva.id,
          habitacionId: habitacion.id,
        },
      });
    }

    // Enviar correo de confirmación
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #b71c1c; padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">Hotel Suspiro</h2>
          <p style="margin: 0;">Confirmación de reserva</p>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #333;">Hola ${nombreCliente},</h3>
          <p>Gracias por reservar con <strong>Hotel Suspiro</strong>. Aquí tienes los detalles de tu reserva:</p>
          <table style="width: 100%; margin-top: 15px; font-size: 15px;">
            <tr>
              <td><strong>Check-in:</strong></td>
              <td>${new Date(fechaEntrada).toLocaleDateString("es-MX")}</td>
            </tr>
            <tr>
              <td><strong>Check-out:</strong></td>
              <td>${new Date(fechaSalida).toLocaleDateString("es-MX")}</td>
            </tr>
            <tr>
              <td><strong>Teléfono:</strong></td>
              <td>${telefono}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${email}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;"><strong>Habitaciones reservadas:</strong></p>
          <ul style="padding-left: 20px;">
            ${habitacionesDisponibles.map(r => `<li>${r.nombre}</li>`).join("")}
          </ul>
          <p style="margin-top: 20px;">Si tienes dudas o necesitas modificar tu reserva, contáctanos respondiendo a este correo.</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #999; font-size: 13px;">
          Hotel Suspiro · Allende S/N · San Felipe, Gto · Tel. 1234567890
        </div>
      </div>
    `;

    try {
      await enviarCorreo(email, "Tu reserva en Hotel Suspiro", html);
    } catch (errorCorreo) {
      console.error("❌ Error al enviar el correo:", errorCorreo);
    }

    return res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error("❌ Error al crear reserva:", error);
    return res.status(500).json({ message: "Error al crear reserva", error });
  }
};


exports.obtenerReservas = async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        cliente: true,
        habitaciones: {
          include: {
            habitacion: true
          }
        }
      }
    });
    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al obtener reservas:", error);
    res.status(500).json({ message: "Error al obtener reservas", error });
  }
};


exports.actualizarEstadoReserva = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    fechaEntrada,
    fechaSalida,
    nombre,
    apellido,
    telefono,
    email
  } = req.body;

  try {
    const reservaActualizada = await prisma.reserva.update({
      where: { id: parseInt(id) },
      data: {
        status,
        fechaEntrada: new Date(fechaEntrada),
        fechaSalida: new Date(fechaSalida),
        nombreCliente: `${nombre} ${apellido}`,
        telefono,
        email
      },
      include: {
        cliente: true,
        habitaciones: { include: { habitacion: true } }
      }
    });

    // Si la reserva tiene un cliente relacionado, actualizar el cliente
    if (reservaActualizada.clienteId) {
      await prisma.cliente.update({
        where: { id: reservaActualizada.clienteId },
        data: {
          nombre,
          apellido,
          telefono,
          email
        }
      });
    }

    // Volver a obtener la reserva completa actualizada
    const reservaCompleta = await prisma.reserva.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        habitaciones: { include: { habitacion: true } }
      }
    });

    res.json(reservaCompleta);
  } catch (error) {
    console.error("❌ Error al actualizar reserva:", error);
    res.status(500).json({ message: "Error al actualizar reserva", error });
  }
};



exports.eliminarReserva = async (req, res) => {
  const { id } = req.params;
  try {
    // Primero eliminamos relaciones en la tabla intermedia
    await prisma.ReservaHabitacion.deleteMany({
      where: { reservaId: parseInt(id) },
    });

    // Luego la reserva
    await prisma.reserva.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Reserva eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar reserva", error });
  }
};
