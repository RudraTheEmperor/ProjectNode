document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const apiKey = document.getElementById('apiKey').value;
    const resultDiv = document.getElementById('result');

    try {
        const response = await fetch('http://localhost:3001/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            resultDiv.innerHTML = '<p>Login successful! Token stored.</p><button id="verifyBtn">Verify and Get Clients</button>';
            document.getElementById('verifyBtn').addEventListener('click', verifyLogin);
        } else {
            const error = await response.json();
            resultDiv.innerHTML = `<p>Error: ${error.error}</p>`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<p>Network error: ${err.message}</p>`;
    }
});

async function verifyLogin() {
    const token = localStorage.getItem('token');
    const resultDiv = document.getElementById('result');

    if (!token) {
        resultDiv.innerHTML = '<p>No token found. Please login first.</p>';
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/v1/cliente', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const clients = await response.json();
            resultDiv.innerHTML = '<h2>Clients:</h2><ul>' + clients.map(c => `<li>${c.nome} - ${c.email}</li>`).join('') + '</ul>';
        } else {
            const error = await response.json();
            resultDiv.innerHTML = `<p>Verification failed: ${error.error}</p>`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<p>Network error: ${err.message}</p>`;
    }
}
