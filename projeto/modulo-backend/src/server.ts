import "dotenv/config";
import { AppDataSource } from "./config/data-source";
import app from "./app";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Banco conectado.");
    app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
  })
  .catch((err) => console.error("Erro ao inicializar o banco:", err));
