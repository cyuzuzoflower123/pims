-- Create database
CREATE DATABASE pharmacy_management;
USE pharmacy_management;

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CATEGORY TABLE
-- =========================
CREATE TABLE category (
    catId INT AUTO_INCREMENT PRIMARY KEY,
    storageInstructions VARCHAR(255) NOT NULL,
    AverageTaxRate DECIMAL(5,2) NOT NULL
);

-- =========================
-- MEDICINE TABLE
-- =========================
CREATE TABLE medicine (
    medId INT AUTO_INCREMENT PRIMARY KEY,
    TradeName VARCHAR(150) NOT NULL,
    GenericName VARCHAR(150) NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    catId INT,
    
    CONSTRAINT fk_medicine_category
        FOREIGN KEY (catId)
        REFERENCES category(catId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================
-- INVENTORY STOCK TABLE
-- =========================
CREATE TABLE InventoryStock (
    stockId INT AUTO_INCREMENT PRIMARY KEY,
    medId INT NOT NULL,
    QuantityInHand INT NOT NULL DEFAULT 0,
    expiryDate DATE NOT NULL,

    CONSTRAINT fk_stock_medicine
        FOREIGN KEY (medId)
        REFERENCES medicine(medId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- SALES TABLE
-- =========================
CREATE TABLE sales (
    saleId INT AUTO_INCREMENT PRIMARY KEY,
    medId INT NOT NULL,
    quantitySold INT NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    saleDate DATETIME NOT NULL,

    CONSTRAINT fk_sales_medicine
        FOREIGN KEY (medId)
        REFERENCES medicine(medId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- SAMPLE DATA (OPTIONAL)
-- =========================

-- Categories
INSERT INTO category (storageInstructions, AverageTaxRate)
VALUES
('Store in cool dry place', 18.00),
('Keep refrigerated', 10.00);

-- Medicines
INSERT INTO medicine (TradeName, GenericName, UnitPrice, catId)
VALUES
('Panadol', 'Paracetamol', 500.00, 1),
('Amoxil', 'Amoxicillin', 1200.00, 2);

-- Inventory
INSERT INTO InventoryStock (medId, QuantityInHand, expiryDate)
VALUES
(1, 100, '2027-12-31'),
(2, 50, '2026-11-15');

-- Sales
INSERT INTO sales (medId, quantitySold, totalAmount, saleDate)
VALUES
(1, 2, 1000.00, NOW());