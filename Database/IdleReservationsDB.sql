CREATE DATABASE IdleReservationsDB;
GO

USE IdleReservationsDB;
GO

-- ROLE
CREATE TABLE Role (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(100) NOT NULL UNIQUE
);

-- USER
CREATE TABLE [User] (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Salt NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    RoleId INT NOT NULL,
    CONSTRAINT fk_user_role FOREIGN KEY (RoleId) REFERENCES Role(RoleId)
);

-- RESTAURANT
CREATE TABLE Restaurant (
    RestaurantId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(300),
    City NVARCHAR(100)
);

-- TABLE (restaurant tables)
CREATE TABLE [Table] (
    TableId INT IDENTITY(1,1) PRIMARY KEY,
    RestaurantId INT NOT NULL,
    Seats INT NOT NULL,
    CONSTRAINT fk_table_restaurant FOREIGN KEY (RestaurantId) 
        REFERENCES Restaurant(RestaurantId) ON DELETE CASCADE
);

-- PROMOTION
CREATE TABLE Promotion (
    PromotionId INT IDENTITY(1,1) PRIMARY KEY,
    RestaurantId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    DiscountPercent DECIMAL(5,2),
    CONSTRAINT fk_promo_restaurant FOREIGN KEY (RestaurantId) 
        REFERENCES Restaurant(RestaurantId) ON DELETE CASCADE
);

-- RESERVATION
CREATE TABLE Reservation (
    ReservationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    RestaurantId INT NOT NULL,
    TableId INT NOT NULL,
    ReservationDateTime DATETIME2 NOT NULL,
    PartySize INT NOT NULL,
    Status NVARCHAR(20) DEFAULT 'pending',
    CONSTRAINT fk_reservation_user FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE SET NULL,
    CONSTRAINT fk_reservation_restaurant FOREIGN KEY (RestaurantId) REFERENCES Restaurant(RestaurantId) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_table FOREIGN KEY (TableId) REFERENCES [Table](TableId) ON DELETE NO ACTION
);

-- NOTIFICATION
CREATE TABLE Notification (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(200),
    Message NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CONSTRAINT fk_notification_user FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE CASCADE
);

-- SEED DATA
-- Roles
INSERT INTO Role (RoleName) VALUES ('Admin'), ('User');

-- Users (password hashes are placeholders)
INSERT INTO [User] (Username, Email, PasswordHash, Salt, FirstName, LastName, RoleId)
VALUES 
('admin123', 'admin@example.com', 'HASH_PLACEHOLDER', 'SALT_PLACEHOLDER', 'Admin', 'User', 1),
('user123', 'user@example.com', 'HASH_PLACEHOLDER', 'SALT_PLACEHOLDER', 'Regular', 'User', 2);

-- Restaurant
INSERT INTO Restaurant (Name, Address, City)
VALUES ('Idle Central', 'Ilica 1', 'Zagreb');

-- Table
INSERT INTO [Table] (RestaurantId, Seats)
VALUES (1, 4);

-- Promotion
INSERT INTO Promotion (RestaurantId, Title, DiscountPercent)
VALUES (1, 'Happy Hour', 20.00);

-- Example Reservation
INSERT INTO Reservation (UserId, RestaurantId, TableId, ReservationDateTime, PartySize, Status)
VALUES (2, 1, 1, '2026-03-25 19:00', 2, 'confirmed');

-- Example Notification
INSERT INTO Notification (UserId, Title, Message)
VALUES (2, 'Reservation Confirmed', 'Your reservation at Idle Central is confirmed.');


ALTER TABLE Reservation
ALTER COLUMN UserId INT NOT NULL;