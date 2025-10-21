import { useEffect, useState } from "react";

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // IMPORTANTE: dentro do Docker, use o nome do serviço node_app
    fetch("http://localhost:3001/api/v1/cliente")
      .then((res) => res.json())
      .then((data) => {
        setClientes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar clientes:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f9fafb",
        color: "#333",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#0070f3" }}>🚀 Laboratório de Programação</h1>
      <p style={{ marginBottom: 20 }}>
        Next.js rodando no Docker com MySQL, Flask, Node, Mongo e UIs.
      </p>

      <h2>📋 Lista de Clientes</h2>

      {loading ? (
        <p>Carregando clientes...</p>
      ) : clientes.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "300px",
          }}
        >
          {clientes.map((cliente) => (
            <li id={cliente.id}
              key={cliente.id}
              style={{
                padding: "10px 15px",
                borderBottom: "1px solid #eee",
              }}
            >
              {cliente.nome}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum cliente encontrado.</p>
      )}

      {/* 🔌 Secção de portas */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <strong>🔌 Portas:</strong>
        <div>MySQL: 3306</div>
        <div>phpMyAdmin: 8080</div>
        <div>Node.js: 3001</div>
        <div>Flask: 5000</div>
        <div>Next.js: 3000</div>
        <div>MongoDB: 27017</div>
        <div>Mongo Express: 8081</div>
      </div>

      <p><a href="/login">Go to Login Page</a></p>
      <p><a href="http://localhost:8080" target="_blank">Access phpMyAdmin</a></p>
      <p><a href="http://localhost:8081" target="_blank">Access Mongo Express</a></p>
    </div>
  );
}
