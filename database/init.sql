-- Portfolio Tracker Database Schema
-- Separate schemas for each microservice

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Portfolios table
CREATE TABLE product (
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    week_day TEXT,
    hour TEXT,
    ticket_number VARCHAR(50),
    waiter DECIMAL(20,8),
    product_name TEXT,
    quantity DECIMAL(20,8),
    unitary_price DECIMAL(20,8),
    total DECIMAL(20,8)


);
COPY product FROM '/data/my_file.csv' DELIMITER ',' CSV HEADER;