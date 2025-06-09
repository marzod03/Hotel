const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.obtenerHabitaciones = async (req, res) => {
  try {
    const habitaciones = await prisma.habitacion.findMany({
      include: {
        Habitacion: true
      },
    });

    const hoy = new Date();

    const habitacionesConPromocion = habitaciones.map((habitacion) => {
      const promocionesActivas = habitacion.promociones.filter((promo) => {
        const inicio = new Date(promo.inicio);
        const fin = new Date(promo.fin);
        return inicio <= hoy && hoy <= fin;
      });

      const promocionActiva = promocionesActivas.length > 0 ? promocionesActivas[0] : null;

      return {
        id: habitacion.id,
        nombre: habitacion.nombre,
        descripcion: habitacion.descripcion,
        tipoHabitacion: habitacion.tipoHabitacion,
        precio: habitacion.precio,
        imagenUrl: habitacion.imagenUrl,
        promociones: habitacion.promociones,
        promocionActiva: !!promocionActiva,
        precioDescuento: promocionActiva?.precioPromo || null,
        promocionFin: promocionActiva?.fin || null,
      };
    });

    res.json(habitacionesConPromocion);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ message: "Error al obtener habitaciones", error });
  }
};



exports.crearHabitacion = async (req, res) => {
  const { nombre, precio, descripcion, imagenUrl } = req.body;
  try {
    const habitacion = await prisma.habitacion.create({
      data: {
        nombre,
        precio: parseFloat(precio),
        descripcion,
        imagenUrl
      }
    });
    res.status(201).json(habitacion);
  } catch (error) {
    console.error("Error en backend:", error.message || error);
    res.status(500).json({ message: "Error al crear habitación", error: error.message });
  }
};

exports.actualizarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descripcion, imagenUrl } = req.body;

  try {
    const habitacion = await prisma.habitacion.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        precio: parseFloat(precio),
        descripcion,
        imagenUrl
      }
    });

    res.json(habitacion);
  } catch (error) {
    console.error("ERROR ACTUALIZAR:", error);
    res.status(500).json({ message: "Error al actualizar habitación", error });
  }
};

exports.eliminarHabitacion = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.habitacion.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Habitación eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar habitación", error });
  }
};



