import { useState, useEffect } from 'react';

export default function Login() {
  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [mongoData, setMongoData] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setMessage('Login bem-sucedido! Token armazenado.');
      } else {
        const error = await response.json();
        setMessage(`Erro: ${error.error}`);
      }
    } catch (err) {
      setMessage(`Erro de rede: ${err.message}`);
    }
  };

  const handleVerify = async () => {
    if (!token) {
      setMessage('Nenhum token encontrado. Faça login primeiro.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/v1/cliente', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const clientsData = await response.json();
        setClients(clientsData);
        setMessage('Verificação bem-sucedida!');
      } else {
        const error = await response.json();
        setMessage(`Verificação falhou: ${error.error}`);
      }
    } catch (err) {
      setMessage(`Erro de rede: ${err.message}`);
    }
  };

  const handleFetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
        setMessage('Usuários obtidos do Flask!');
      } else {
        setMessage('Falha ao obter usuários do Flask.');
      }
    } catch (err) {
      setMessage(`Erro de rede: ${err.message}`);
    }
  };

  const handleFetchMongo = async () => {
    try {
      const response = await fetch('http://localhost:5000/mongo-data');
      if (response.ok) {
        const mongoDataFetched = await response.json();
        setMongoData(mongoDataFetched);
        setMessage('Dados do Mongo obtidos do Flask!');
      } else {
        setMessage('Falha ao obter dados do Mongo do Flask.');
      }
    } catch (err) {
      setMessage(`Erro de rede: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setClients([]);
    setUsers([]);
    setMongoData([]);
    setMessage('Logout realizado com sucesso.');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>Login e Verificação</h1>
      {!token ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Digite a Chave da API"
            required
            style={{ padding: '10px', margin: '5px' }}
          />
          <button type="submit" style={{ padding: '10px', margin: '5px' }}>Login</button>
        </form>
      ) : (
        <div>
          <p>Logado.</p>
          <button onClick={handleLogout} style={{ padding: '10px', margin: '5px' }}>Logout</button>
          <button onClick={handleVerify} style={{ padding: '10px', margin: '5px' }}>Verificar e Obter Clientes (MySQL via Node 3001)</button>
          <button onClick={handleFetchUsers} style={{ padding: '10px', margin: '5px' }}>Obter Usuários do Flask (5000)</button>
          <button onClick={handleFetchMongo} style={{ padding: '10px', margin: '5px' }}>Obter Dados do Mongo do Flask (5000)</button>
          <p><a href="http://localhost:8080" target="_blank">Acessar phpMyAdmin (8080)</a></p>
          <p><a href="http://localhost:8081" target="_blank">Acessar Mongo Express (8081)</a></p>
          {clients.length > 0 && (
            <div>
              <h2>Clientes do MySQL:</h2>
              <ul>
                {clients.map(c => <li key={c.id}>{c.nome} - {c.email}</li>)}
              </ul>
            </div>
          )}
          {users.length > 0 && (
            <div>
              <h2>Usuários do Flask:</h2>
              <ul>
                {users.map(u => <li key={u.id}>{u.name}</li>)}
              </ul>
            </div>
          )}
          {mongoData.length > 0 && (
            <div>
              <h2>Dados do Mongo do Flask:</h2>
              <ul>
                {mongoData.map((item, index) => <li key={index}>{JSON.stringify(item)}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>{message}</div>
    </div>
  );
}
