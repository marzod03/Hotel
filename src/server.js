require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.get("/", (req, res) => res.send("API Hotel funcionando ✅"));
app.use("/api/habitaciones", require("./routes/habitaciones.routes"));
app.use("/api/reservas", require("./routes/reservas.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/promociones", require("./routes/promociones.routes"));
app.use("/api/admins", require("./routes/admin.routes"));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
