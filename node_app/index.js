import express from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import cors from "cors";
// 🚀 Inicialização
const app = express();
const PORT = 3001;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// 🔑 Configurações
const JWT_SECRET = "asdihoashdoiashdoiq1h8h0-18h081d081h0dh18idh0has0dih0asd"; // troque por algo seguro
const API_KEY = "d190981dh0891h0dihasoidhoiwh01ihd01ihd"; // sua API key estática

// 💾 Configuração do MySQL
const dbConfig = {
  host: "mysql",
  user: "appuser",
  password: "apppass",
  database: "appdb"
};

// 🧠 Middleware para verificar JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1]; // formato: "Bearer <token>"

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    req.user = user; // payload do JWT
    next();
  });
}

// 🔑 Endpoint para gerar token usando API Key
app.post("/auth", (req, res) => {
  const { apiKey } = req.body;

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "API Key inválida" });
  }

  const payload = { role: "admin", name: "API User" };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

// 🏠 Página inicial
app.get("/", (req, res) => {
  res.send("<h1>📖 API de Clientes com JWT + API Key</h1>");
});

// 🔓 Listar clientes (público)
app.get("/api/v1/cliente", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM clientes");
    await connection.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔒 Criar cliente (protegido com JWT)
app.post("/api/v1/cliente", authenticateJWT, async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, email, telefone" });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)",
      [nome, email, telefone]
    );
    await connection.end();

    res.status(201).json({
      message: "Cliente criado com sucesso!",
      clienteId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔒 Deletar cliente (protegido com JWT)
app.delete("/api/v1/cliente/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute("DELETE FROM clientes WHERE id = ?", [id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json({ message: "Cliente deletado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Node rodando na porta ${PORT}`);
});
