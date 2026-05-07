-- Portfolio Tracker Database Schema
-- Separate schemas for each microservice

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Portfolio Service Schema
CREATE SCHEMA IF NOT EXISTS portfolio_service;

-- Users table
CREATE TABLE portfolio_service.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolios table
CREATE TABLE portfolio_service.portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES portfolio_service.users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_value DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instruments table (stocks, bonds, options, etc.)
CREATE TABLE portfolio_service.instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'stock', 'option', 'bond', 'crypto', etc.
    exchange VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holdings table
CREATE TABLE portfolio_service.holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolio_service.portfolios(id),
    instrument_id UUID REFERENCES portfolio_service.instruments(id),
    quantity DECIMAL(20,8) NOT NULL,
    average_cost DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    market_value DECIMAL(20,8) GENERATED ALWAYS AS (quantity * current_price) STORED,
    unrealized_pnl DECIMAL(20,8) GENERATED ALWAYS AS ((current_price - average_cost) * quantity) STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Service Schema
CREATE SCHEMA IF NOT EXISTS transaction_service;

-- Transactions table
CREATE TABLE transaction_service.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolio_service.portfolios(id),
    instrument_id UUID REFERENCES portfolio_service.instruments(id),
    type VARCHAR(20) NOT NULL, -- 'buy', 'sell'
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    total_amount DECIMAL(20,8) NOT NULL,
    
    -- Commission and tariffs
    broker_commission DECIMAL(20,8) DEFAULT 0,
    exchange_commission DECIMAL(20,8) DEFAULT 0,
    transaction_tariff DECIMAL(20,8) DEFAULT 0,
    total_fees DECIMAL(20,8) GENERATED ALWAYS AS (broker_commission + exchange_commission + transaction_tariff) STORED,
    net_amount DECIMAL(20,8) GENERATED ALWAYS AS (total_amount + broker_commission + exchange_commission + transaction_tariff) STORED,
    
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Agent Orchestrator Schema
CREATE SCHEMA IF NOT EXISTS agent_service;

-- Agents table
CREATE TABLE agent_service.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'risk_analyzer', 'market_analyzer', 'portfolio_optimizer'
    description TEXT,
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Recommendations table
CREATE TABLE agent_service.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agent_service.agents(id),
    portfolio_id UUID REFERENCES portfolio_service.portfolios(id),
    instrument_id UUID REFERENCES portfolio_service.instruments(id),
    recommendation_type VARCHAR(50) NOT NULL, -- 'buy', 'sell', 'hold'
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
    reasoning TEXT,
    target_price DECIMAL(20,8),
    time_horizon VARCHAR(50), -- 'short_term', 'medium_term', 'long_term'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Cryptocurrency Service Schema
CREATE SCHEMA IF NOT EXISTS crypto_service;

-- Crypto Exchanges table
CREATE TABLE crypto_service.exchanges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crypto Holdings table
CREATE TABLE crypto_service.crypto_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolio_service.portfolios(id),
    exchange_id UUID REFERENCES crypto_service.exchanges(id),
    symbol VARCHAR(50) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    average_cost DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    wallet_address VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_portfolio_holdings_portfolio_id ON portfolio_service.holdings(portfolio_id);
CREATE INDEX idx_portfolio_holdings_instrument_id ON portfolio_service.holdings(instrument_id);
CREATE INDEX idx_transactions_portfolio_id ON transaction_service.transactions(portfolio_id);
CREATE INDEX idx_transactions_instrument_id ON transaction_service.transactions(instrument_id);
CREATE INDEX idx_recommendations_portfolio_id ON agent_service.recommendations(portfolio_id);
CREATE INDEX idx_crypto_holdings_portfolio_id ON crypto_service.crypto_holdings(portfolio_id);

-- Demo user (password: demo123)
INSERT INTO portfolio_service.users (id, email, password_hash, first_name, last_name)
VALUES (
  uuid_generate_v4(),
  'demo@example.com',
  '$2a$10$1Lq5SnYEYbmEdAx9S6g5k.0LohPtO2FhzcgnIrGx4hlozxgjAvZaO',
  'Demo',
  'User'
) ON CONFLICT (email) DO NOTHING;
