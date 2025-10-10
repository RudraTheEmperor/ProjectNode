const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 3001;


const JWT_SECRET = "asdihoashdoiashdoiq1h8h0-18h081d081h0dh18idh0has0dih0asd"; // troque por algo seguro
const API_KEY = "my-secret-api-key"; // sua API key estática

app.use(express.json()); // For Express 4.16.0 and above
app.use(cors());


//// Configuração do MySQL
const dbConfig = {
  host: "mysql",
  user: "appuser",
  password: "apppass",
  database: "appdb"
};

// Middleware para verificar JWT
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

// Endpoint para gerar token usando API Key
app.post("/auth", (req, res) => {
  const { apiKey } = req.body;

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "API Key inválida" });
  }

  // Aqui você pode incluir dados do usuário, permissões, etc.
  const payload = { role: "admin", name: "API User" };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

// Página inicial
app.get("/", (req, res) => {
  res.send("<h1>📖 API de Clientes com JWT + API Key</h1><p><a href='http://localhost:3000/login'>Ir para a Página de Login</a></p>");
});

// Listar clientes (protegido com JWT)
app.get("/api/v1/cliente", authenticateJWT, async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor Node rodando na porta ${PORT}`);
});