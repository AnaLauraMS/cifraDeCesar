import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoImg from './assets/logo.jpg';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de Sessão e Autenticação (apenas em memória, sem persistência entre reinicializações)
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  // Estados de Cadastro
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Estados de Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Estados da Tela de Criptografar
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(3);
  const [encryptionResult, setEncryptionResult] = useState(null);

  // Estados da Tela de Descriptografar
  const [encryptedInput, setEncryptedInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');

  // Ao abrir ou recarregar a aplicação, garante que qualquer resíduo antigo seja destruído
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  // Limpa campos sensíveis e mensagens temporárias ao alternar de aba
  useEffect(() => {
    setError('');
    setCopyFeedback('');
    if (location.pathname === '/login' || location.pathname === '/register') {
      setUsername('');
      setPassword('');
      setRegUsername('');
      setRegPassword('');
    }
  }, [location.pathname]);

  // Função utilitária para limpar todos os dados de mensagens/cifras
  const resetCipherStates = () => {
    setMessage('');
    setStep(3);
    setEncryptionResult(null);
    setEncryptedInput('');
    setHashInput('');
    setDecryptedResult('');
    setCopyFeedback('');
  };

  const navigateTo = (path) => {
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setRegUsername('');
    setRegPassword('');
    navigate(path);
  };

  // Funções de Ação

  // 1. Cadastro de Usuário
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await axios.post('http://localhost:8080/auth/register', {
        username: regUsername,
        password: regPassword
      });
      setSuccessMsg('Tripulante cadastrado com sucesso! Faça login com suas credenciais.');
      setRegUsername('');
      setRegPassword('');
      resetCipherStates();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Erro ao cadastrar. O usuário já pode existir.');
    }
  };

  // 2. Login (Autenticação JWT)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        username,
        password
      });
      const receivedToken = response.data.token;

      // Define a sessão em memória
      setToken(receivedToken);
      setCurrentUser(username);

      // Limpa os formulários de login e qualquer dado anterior de cifras
      setUsername('');
      setPassword('');
      resetCipherStates();

      setSuccessMsg(`Autenticado com sucesso! Bem-vindo a bordo, ${username}.`);
      navigate('/encrypt');
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  // 3. Desembarque (Logout Completo)
  const handleLogout = () => {
    // Destrói todo o estado em memória
    setToken('');
    setCurrentUser('');
    setUsername('');
    setPassword('');
    setRegUsername('');
    setRegPassword('');
    resetCipherStates();

    // Limpa qualquer armazenamento local
    localStorage.clear();
    sessionStorage.clear();

    setSuccessMsg('Você desembarcou com sucesso.');
    setError('');
    navigate('/login');
  };

  // 4. Criptografar
  const handleEncrypt = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!message || !message.trim()) {
      setError('Por favor, informe a mensagem a ser criptografada.');
      return;
    }

    if (step === '' || isNaN(Number(step))) {
      setError('Por favor, informe o passo (deslocamento para mais ou para menos).');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/cipher/encrypt',
        { message: message.trim(), step: Number(step) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEncryptionResult(response.data);
      setSuccessMsg('Mensagem criptografada e Hash (Chave Privada) gerado e armazenado com sucesso!');
    } catch (err) {
      setError(err.response?.data || 'Erro ao criptografar a mensagem.');
    }
  };

  // 5. Descriptografar (Validação de Hash e Uso Único)
  const handleDecrypt = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDecryptedResult('');

    if (!encryptedInput || !encryptedInput.trim()) {
      setError('Por favor, informe a mensagem criptografada.');
      return;
    }

    if (!hashInput || !hashInput.trim()) {
      setError('Por favor, informe o hash correspondente.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/cipher/decrypt',
        { encryptedMessage: encryptedInput.trim(), hashKey: hashInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDecryptedResult(response.data);
      setSuccessMsg('Hash validado com sucesso! A mensagem original (texto claro) foi descriptografada.');
    } catch (err) {
      setError(err.response?.data || 'Erro ao descriptografar: hash inválido ou já utilizado.');
    }
  };

  // Cópia rápida para clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copiado para a área de transferência!`);
    setTimeout(() => setCopyFeedback(''), 3000);
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
        <p style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: '5px' }}>Cifra de César & Segurança da Informação</p>
      </div>

      {/* Barra de Status do Usuário Logado */}
      {token && (
        <div className="user-bar">
          <div className="user-badge">
            ⚓ Tripulante conectado: <span>{currentUser}</span>
          </div>
          <button className="nav-btn logout-btn" onClick={handleLogout} title="Encerrar sessão e limpar tudo">
            🚪 Desembarcar (Logout)
          </button>
        </div>
      )}

      {/* Barra de Navegação por Rotas (Exibe as 4 telas solicitadas nos requisitos) */}
      <div className="navbar">
        {!token ? (
          <>
            <button
              className={`nav-btn ${location.pathname === '/register' ? 'active' : ''}`}
              onClick={() => navigateTo('/register')}
            >
              1. Cadastro de Usuário
            </button>
            <button
              className={`nav-btn ${location.pathname === '/login' ? 'active' : ''}`}
              onClick={() => navigateTo('/login')}
            >
              2. Login
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-btn ${location.pathname === '/encrypt' ? 'active' : ''}`}
              onClick={() => navigateTo('/encrypt')}
            >
              3. Criptografar
            </button>
            <button
              className={`nav-btn ${location.pathname === '/decrypt' ? 'active' : ''}`}
              onClick={() => navigateTo('/decrypt')}
            >
              4. Descriptografar
            </button>
          </>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}
      {successMsg && <div className="alert-success">{successMsg}</div>}

      {/* Definição das Rotas da Aplicação */}
      <Routes>
        {/* Raiz redireciona para criptografar se logado, ou cadastro se não logado */}
        <Route path="/" element={<Navigate to={token ? "/encrypt" : "/register"} replace />} />

        {/* 1. Tela de Cadastro de Usuário */}
        <Route path="/register" element={
          token ? <Navigate to="/encrypt" replace /> : (
            <div className="card">
              <h2>1. Cadastro de Usuário</h2>
              <p style={{ color: '#94a3b8', marginTop: '-10px', marginBottom: '20px' }}>
                Cadastre um novo usuário com senha criptografada no banco de dados.
              </p>
              <form onSubmit={handleRegister} autoComplete="off">
                <div className="form-group">
                  <label>Usuário:</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Digite o nome de usuário..."
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Senha:</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Cadastrar Usuário</button>
              </form>
            </div>
          )
        } />

        {/* 2. Tela de Login */}
        <Route path="/login" element={
          token ? <Navigate to="/encrypt" replace /> : (
            <div className="card">
              <h2>2. Tela de Login</h2>
              <p style={{ color: '#94a3b8', marginTop: '-10px', marginBottom: '20px' }}>
                Validação de credenciais no banco de dados com autenticação JWT (Autenticidade e Integridade).
              </p>
              <form onSubmit={handleLogin} autoComplete="off">
                <div className="form-group">
                  <label>Usuário:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Informe seu usuário..."
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Senha:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Informe sua senha..."
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Entrar e Autenticar com JWT</button>
              </form>
            </div>
          )
        } />

        {/* 3. Tela de Criptografar */}
        <Route path="/encrypt" element={
          token ? (
            <div className="card">
              <h2>3. Tela de Criptografar (Cifra de César)</h2>
              <p style={{ color: '#94a3b8', marginTop: '-10px', marginBottom: '20px' }}>
                Alfabeto alfanumérico suportado: <code>a-z, 0-9</code>. Suporta deslocamento positivo e negativo.
              </p>
              <form onSubmit={handleEncrypt} noValidate>
                <div className="form-group">
                  <label>Mensagem a ser criptografada:</label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite a mensagem a ser criptografada..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Passo (número de casas a serem deslocadas [para mais ou para menos]):</label>
                  <input
                    type="number"
                    value={step}
                    onChange={(e) => setStep(e.target.value)}
                    placeholder="Ex: 3 ou -3"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Criptografar Mensagem</button>
              </form>

              {encryptionResult && (
                <div className="result-box" style={{ marginTop: '20px' }}>
                  <p><strong>Mensagem Criptografada:</strong> <span style={{ color: '#38bdf8', fontSize: '1.05rem', wordBreak: 'break-all' }}>{encryptionResult.encryptedText}</span></p>
                  <p><strong>Hash (Chave Privada para Descriptografia):</strong></p>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '6px', border: '1px solid #334155', wordBreak: 'break-all', fontFamily: 'monospace', color: '#f59e0b', fontSize: '0.9rem' }}>
                    {encryptionResult.hashKey}
                  </div>

                  {copyFeedback && <div className="copy-feedback">{copyFeedback}</div>}

                  <div className="action-buttons">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => copyToClipboard(encryptionResult.hashKey, 'Hash (Chave Privada)')}
                    >
                      📋 Copiar Hash (Chave)
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => copyToClipboard(encryptionResult.encryptedText, 'Mensagem Criptografada')}
                    >
                      📋 Copiar Mensagem Criptografada
                    </button>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '12px' }}>
                    * O hash acima foi gerado (SHA-256) e armazenado no banco de dados com a trava de uso único (usado = false). Cole os dados na tela de Descriptografar para decodificar.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* 4. Tela de Descriptografar */}
        <Route path="/decrypt" element={
          token ? (
            <div className="card">
              <h2>4. Tela de Descriptografar</h2>
              <p style={{ color: '#94a3b8', marginTop: '-10px', marginBottom: '20px' }}>
                Validação de existência do Hash no banco de dados e trava de uso único.
              </p>
              <form onSubmit={handleDecrypt} noValidate>
                <div className="form-group">
                  <label>Mensagem criptografada:</label>
                  <input
                    type="text"
                    value={encryptedInput}
                    onChange={(e) => setEncryptedInput(e.target.value)}
                    placeholder="Cole ou digite a mensagem criptografada..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hash correspondente (Chave Privada):</label>
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Cole o hash correspondente gerado na criptografia..."
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>Descriptografar</button>
              </form>

              {decryptedResult && (
                <div className="result-box" style={{ borderColor: '#10b981', marginTop: '20px' }}>
                  <p style={{ color: '#34d399', fontSize: '1.2rem', margin: '5px 0' }}>
                    <strong>Texto Claro (Mensagem Original):</strong> {decryptedResult}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '8px' }}>
                    ✅ Hash validado com sucesso e marcado no banco como utilizado (usado = true). Não poderá ser reutilizado.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
