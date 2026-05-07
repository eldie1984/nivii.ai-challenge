import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PortfolioDetail from './pages/PortfolioDetail';
import Transactions from './pages/Transactions';
import Agents from './pages/Agents';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="portfolio/:id" element={<PortfolioDetail />} />
                      <Route path="transactions" element={<Transactions />} />
                      <Route path="agents" element={<Agents />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;
