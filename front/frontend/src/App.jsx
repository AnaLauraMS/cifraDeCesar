import { useState } from 'react';
import axios from 'axios';
import logoImg from './assets/logo.jpg'; // Importa a imagem corretamente para o Vite
import './App.css';

function App() {
  // Controle de abas da apresentação: 'register', 'login', 'dashboard'
  const [currentTab, setCurrentTab] = useState('login');

  // Estados de Cadastro
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Estados de Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // Estados da Cifra de César
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(3);
  const [encryptionResult, setEncryptionResult] = useState(null);

  // Estados de Descriptografia
  const [encryptedInput, setEncryptedInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Função de Cadastro
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await axios.post('http://localhost:8080/auth/register', {
        username: regUsername,
        password: regPassword
      });
      setSuccessMsg('Tripulante cadastrado com sucesso! Vá para a aba de Login.');
      setRegUsername('');
      setRegPassword('');
    } catch (err) {
      setError('Erro ao cadastrar. O usuário já pode existir.');
    }
  };

  // 2. Função de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        username,
        password
      });
      setToken(response.data.token);
      setSuccessMsg('Log Pose ativado! Bem-vindo ao painel de Poneglyphs.');
      setCurrentTab('dashboard'); // Vai direto para o painel após logar
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  // 3. Função para Cifrar
  const handleEncrypt = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        'http://localhost:8080/api/cipher/encrypt',
        { message, step: Number(step) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEncryptionResult(response.data);
      setEncryptedInput(response.data.encryptedText);
      setHashInput(response.data.hashKey);
    } catch (err) {
      setError('Erro ao cifrar a mensagem.');
    }
  };

  // 4. Função para Descriptografar
  const handleDecrypt = async (e) => {
    e.preventDefault();
    setError('');
    setDecryptedResult('');
    try {
      const response = await axios.post(
        'http://localhost:8080/api/cipher/decrypt',
        { encryptedMessage: encryptedInput, hashKey: hashInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDecryptedResult(response.data);
    } catch (err) {
      setError(err.response?.data || 'Erro ao descriptografar ou hash já utilizado.');
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src={logoImg} // Utiliza a variável importada do logo
          alt="Bandeira One Piece"
          style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '10px', filter: 'drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.6))' }}
        />
        <h1 style={{ margin: '0' }}>Poneglyph Cipher</h1>
        <br></br>
        <p style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '5px' }}>O Grande Tesouro Criptografado</p>
      </div>

      {/* Barra de Navegação para a Apresentação */}
      <div className="navbar">
        <button
          className={`nav-btn ${currentTab === 'register' ? 'active' : ''}`}
          onClick={() => { setCurrentTab('register'); setError(''); setSuccessMsg(''); }}
        >
          1. Cadastrar Tripulante
        </button>
        <button
          className={`nav-btn ${currentTab === 'login' ? 'active' : ''}`}
          onClick={() => { setCurrentTab('login'); setError(''); setSuccessMsg(''); }}
        >
          2. Login (JWT)
        </button>
        {token && (
          <button
            className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('dashboard'); setError(''); setSuccessMsg(''); }}
          >
            3. Painel de Poneglyphs 🗺️
          </button>
        )}
      </div>

      {error && <div className="alert-error">⚠️ {error}</div>}
      {successMsg && <div className="alert-success">✨ {successMsg}</div>}

      {/* ABA 1: CADASTRO */}
      {currentTab === 'register' && (
        <div className="card">
          <h2>Novo Tripulante (Register)</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Usuário:</label>
              <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Senha:</label>
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Cadastrar na Base</button>
          </form>
        </div>
      )}

      {/* ABA 2: LOGIN */}
      {currentTab === 'login' && (
        <div className="card">
          <h2>Acesso ao Navio (Login & JWT)</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Usuário:</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Senha:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Entrar e Gerar Token</button>
          </form>
        </div>
      )}

      {/* ABA 3: PAINEL DE PONEGLYPHS */}
      {currentTab === 'dashboard' && token && (
        <div>
          {/* Criptografia */}
          <div className="card">
            <h2>📜 Cifrar Poneglyph (Cifra de César)</h2>
            <form onSubmit={handleEncrypt}>
              <div className="form-group">
                <label>Mensagem Secreta:</label>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Deslocamento (Step):</label>
                <input type="number" value={step} onChange={(e) => setStep(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary">Cifrar Mensagem</button>
            </form>

            {encryptionResult && (
              <div className="result-box">
                <p><strong>Texto Cifrado:</strong> {encryptionResult.encryptedText}</p>
                <p><strong>Log Pose (Hash):</strong> {encryptionResult.hashKey}</p>
              </div>
            )}
          </div>

          {/* Descriptografia */}
          <div className="card">
            <h2>🔓 Decodificar Poneglyph (Trava de Uso Único)</h2>
            <form onSubmit={handleDecrypt}>
              <div className="form-group">
                <label>Texto Cifrado:</label>
                <input type="text" value={encryptedInput} onChange={(e) => setEncryptedInput(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Log Pose (Hash):</label>
                <input type="text" value={hashInput} onChange={(e) => setHashInput(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>Decodificar</button>
            </form>

            {decryptedResult && (
              <div className="result-box" style={{ borderColor: '#10b981' }}>
                <p style={{ color: '#34d399', fontSize: '1.1rem' }}><strong>Mensagem Original:</strong> {decryptedResult}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;