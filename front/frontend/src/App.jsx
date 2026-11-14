import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import logoImg from './assets/logo.jpg';
import './App.css';

function App() {
  const navigate = useNavigate();

  // Estados globais compartilhados
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados de Cadastro
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Estados de Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Estados da Cifra de César
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(3);
  const [encryptionResult, setEncryptionResult] = useState(null);

  // Estados de Descriptografia (Manuais)
  const [encryptedInput, setEncryptedInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');

  // Funções de Ação
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await axios.post('http://localhost:8080/auth/register', {
        username: regUsername,
        password: regPassword
      });
      setSuccessMsg('Tripulante cadastrado com sucesso! Faça login.');
      setRegUsername('');
      setRegPassword('');
      navigate('/login'); // Vai para a rota de login
    } catch (err) {
      setError('Erro ao cadastrar. O usuário já pode existir.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        username,
        password
      });
      setToken(response.data.token);
      setSuccessMsg('Log Pose ativado! Bem-vindo ao painel.');
      navigate('/encrypt'); // Vai direto para a rota de criptografia
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

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
    } catch (err) {
      setError('Erro ao cifrar a mensagem.');
    }
  };

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
          src={logoImg}
          alt="Bandeira One Piece"
          style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '10px', filter: 'drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.6))' }}
        />
        <h1 style={{ margin: '0' }}>Poneglyph Cipher</h1>
        <br />
        <p style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '5px' }}>O Grande Tesouro Criptografado</p>
      </div>

      {/* Barra de Navegação por Rotas */}
      <div className="navbar">
        <button className="nav-btn" onClick={() => navigate('/register')}>
          1. Cadastrar
        </button>
        <button className="nav-btn" onClick={() => navigate('/login')}>
          2. Login
        </button>
        {token && (
          <>
            <button className="nav-btn" onClick={() => navigate('/encrypt')}>
              3. Cifrar
            </button>
            <button className="nav-btn" onClick={() => navigate('/decrypt')}>
              4. Decodificar
            </button>
          </>
        )}
      </div>

      {error && <div className="alert-error"> {error}</div>}
      {successMsg && <div className="alert-success"> {successMsg}</div>}

      {/* Definição das Rotas da Aplicação */}
      <Routes>
        {/* Redireciona a raiz "/" direto para a rota de cadastro */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Rota de Cadastro */}
        <Route path="/register" element={
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
        } />

        {/* Rota de Login */}
        <Route path="/login" element={
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
        } />

        {/* Rota de Criptografia (Protegida por Token) */}
        <Route path="/encrypt" element={
          token ? (
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
                <div className="result-box" style={{ marginTop: '15px' }}>
                  <p><strong>Texto Cifrado:</strong> {encryptionResult.encryptedText}</p>
                  <p><strong>Log Pose (Hash):</strong> {encryptionResult.hashKey}</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '10px' }}>
                    * Copie os dados acima e navegue até a rota "/decrypt" para testar a leitura manual.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="alert-error"> Acesso negado! Faça o login primeiro na rota /login.</div>
          )
        } />

        {/* Rota de Descriptografia (Protegida por Token e Manual) */}
        <Route path="/decrypt" element={
          token ? (
            <div className="card">
              <h2>Decodificar Poneglyph (Trava de Uso Único)</h2>
              <form onSubmit={handleDecrypt}>
                <div className="form-group">
                  <label>Texto Cifrado:</label>
                  <input 
                    type="text" 
                    value={encryptedInput} 
                    onChange={(e) => setEncryptedInput(e.target.value)} 
                    placeholder="Cole o texto cifrado gerado..." 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Log Pose (Hash):</label>
                  <input 
                    type="text" 
                    value={hashInput} 
                    onChange={(e) => setHashInput(e.target.value)} 
                    placeholder="Cole o hash gerado..." 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>Decodificar</button>
              </form>

              {decryptedResult && (
                <div className="result-box" style={{ borderColor: '#10b981', marginTop: '15px' }}>
                  <p style={{ color: '#34d399', fontSize: '1.1rem' }}><strong>Mensagem Original:</strong> {decryptedResult}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="alert-error"> Acesso negado! Faça o login primeiro na rota /login.</div>
          )
        } />
      </Routes>
    </div>
  );
}

export default App;