import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface ConnectionContextType {
  isOffline: boolean;
  lastConnectionAttempt: Date | null;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isOffline: false,
  lastConnectionAttempt: null
});

export const useConnection = () => useContext(ConnectionContext);

interface ConnectionProviderProps {
  children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<Date | null>(null);

  // Verificar a conexão com o backend periodicamente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Tentar fazer uma requisição simples para verificar a conexão
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        await api.get('/health', { signal: controller.signal });
        
        clearTimeout(timeoutId);
        setIsOffline(false);
      } catch (error) {
        setIsOffline(true);
      }
      
      setLastConnectionAttempt(new Date());
    };

    // Verificar a conexão imediatamente
    checkConnection();
    
    // E depois a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOffline, lastConnectionAttempt }}>
      {children}
    </ConnectionContext.Provider>
  );
};
