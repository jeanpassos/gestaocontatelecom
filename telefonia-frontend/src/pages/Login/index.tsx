import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    // Simulação de login (sem integração real ainda)
    if (email === 'admin@example.com' && password === 'admin123') {
      // Login bem-sucedido
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas. Tente admin@example.com / admin123');
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f7'
    }}>
      <div style={{
        width: '400px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#1D1D1F' }}>Contas de Telefonia</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#86868B' }}>Faça login para acessar o sistema</p>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#ffebee', 
            color: '#d32f2f',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '5px',
                color: '#1D1D1F',
                fontWeight: 500 
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
              placeholder="Seu e-mail"
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                marginBottom: '5px',
                color: '#1D1D1F',
                fontWeight: 500 
              }}
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
              placeholder="Sua senha"
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Entrar
          </button>
        </form>
        
        <p style={{ marginTop: '30px', textAlign: 'center', color: '#86868B', fontSize: '14px' }}>
          © {new Date().getFullYear()} Sistema de Gerenciamento de Contas de Telefonia
        </p>
      </div>
    </div>
  );
};

export default Login;
