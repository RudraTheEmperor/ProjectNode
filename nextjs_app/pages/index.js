export default function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>🚀 Laboratório de Programação</h1>
      <p>Next.js rodando no Docker com MySQL, Flask, Node, Mongo e UIs.</p>
      <p>
        <strong>Portas:</strong><br />
        Next.js: 3000<br />
        Node.js: 3001<br />
        Flask: 5000<br />
        MySQL: 3306<br />
        phpMyAdmin: 8080<br />
        MongoDB: 27017<br />
        Mongo Express: 8081
      </p>
      <p><a href="/login">Go to Login Page</a></p>
      <p><a href="http://localhost:8080" target="_blank">Access phpMyAdmin</a></p>
      <p><a href="http://localhost:8081" target="_blank">Access Mongo Express</a></p>
    </div>
  );
}
