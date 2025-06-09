const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.crearPromocion = async (req, res) => {
  const { habitacionId, precioPromo, inicio, fin } = req.body;

  if (!habitacionId || !precioPromo || !inicio || !fin) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const nuevaPromocion = await prisma.promocion.create({
      data: {
        habitacionId: parseInt(habitacionId),
        precioPromo: parseFloat(precioPromo),
        inicio: new Date(inicio),
        fin: new Date(fin)
      }
    });

    res.status(201).json(nuevaPromocion);
  } catch (error) {
    console.error("Error al crear promoción:", error);
    res.status(500).json({ message: "Error al registrar la promoción", error });
  }
};

exports.eliminarPromocion = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.promocion.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Promoción eliminada" });
  } catch (error) {
    console.error("Error al eliminar promoción:", error);
    res.status(500).json({ message: "Error al eliminar promoción", error });
  }
};


exports.actualizarPromocion = async (req, res) => {
  const { id } = req.params;
  const { precioPromo, inicio, fin } = req.body;

  try {
    const promocionActualizada = await prisma.promocion.update({
      where: { id: parseInt(id) },
      data: {
        precioPromo: parseFloat(precioPromo),
        inicio: new Date(inicio),
        fin: new Date(fin)
      }
    });

    res.json(promocionActualizada);
  } catch (error) {
    console.error("Error al actualizar promoción:", error);
    res.status(500).json({ message: "Error al actualizar promoción", error });
  }
};

