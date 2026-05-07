import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  change24h: number;
}

interface PortfolioContextType {
  portfolios: Portfolio[];
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (id: string, portfolio: Partial<Portfolio>) => void;
  removePortfolio: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const addPortfolio = (portfolio: Portfolio) => {
    setPortfolios(prev => [...prev, portfolio]);
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const removePortfolio = (id: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PortfolioContext.Provider value={{ portfolios, addPortfolio, updatePortfolio, removePortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};
