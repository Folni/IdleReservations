IF DB_ID('IdleReservationsDB') IS NOT NULL
BEGIN
    ALTER DATABASE IdleReservationsDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE IdleReservationsDB;
END
GO

CREATE DATABASE IdleReservationsDB;
GO

USE IdleReservationsDB;
GO

/* =========================================================
   IDLERESERVATIONS DATABASE SETUP
   ========================================================= */

-- ROLE
CREATE TABLE Role (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- USER
CREATE TABLE [User] (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Salt NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
	LoyaltyPoints INT NOT NULL DEFAULT 0,
    RoleId INT NOT NULL,
    CONSTRAINT fk_user_role FOREIGN KEY (RoleId) REFERENCES Role(RoleId)
);
GO
-- RESTAURANT (UPDATED FOR GOOGLE MAPS)
CREATE TABLE Restaurant (
    RestaurantId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(300),
    City NVARCHAR(100),
    Latitude FLOAT NOT NULL,
    Longitude FLOAT NOT NULL,
    WorkingHours NVARCHAR(100)
);
GO

-- TABLE
CREATE TABLE [Table] (
    TableId INT IDENTITY(1,1) PRIMARY KEY,
    RestaurantId INT NOT NULL,
    Seats INT NOT NULL,
    CONSTRAINT fk_table_restaurant FOREIGN KEY (RestaurantId)
        REFERENCES Restaurant(RestaurantId) ON DELETE CASCADE
);
GO

-- PROMOTION
CREATE TABLE Promotion (
    PromotionId INT IDENTITY(1,1) PRIMARY KEY,
    RestaurantId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    DiscountPercent DECIMAL(5,2),
    CONSTRAINT fk_promo_restaurant FOREIGN KEY (RestaurantId)
        REFERENCES Restaurant(RestaurantId) ON DELETE CASCADE
);
GO

-- RESERVATION
CREATE TABLE Reservation (
    ReservationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    RestaurantId INT NOT NULL,
    TableId INT NOT NULL,
    ReservationDateTime DATETIME2 NOT NULL,
    PartySize INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_reservation_user FOREIGN KEY (UserId)
        REFERENCES [User](UserId),
    CONSTRAINT fk_reservation_restaurant FOREIGN KEY (RestaurantId)
        REFERENCES Restaurant(RestaurantId) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_table FOREIGN KEY (TableId)
        REFERENCES [Table](TableId)
);
GO

-- NOTIFICATION
CREATE TABLE Notification (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(200),
    Message NVARCHAR(MAX),
    IsRead BIT NOT NULL DEFAULT 0,
    CONSTRAINT fk_notification_user FOREIGN KEY (UserId)
        REFERENCES [User](UserId) ON DELETE CASCADE
);
GO


CREATE TABLE FCM_Tokens (
	FcmId INT IDENTITY(1,1) PRIMARY KEY,
	Token NVARCHAR(200) NOT NULL,
	UserId INT NOT NULL
	CONSTRAINT fk_notifications_user FOREIGN KEY (UserId)
        REFERENCES [User](UserId) ON DELETE CASCADE
)

GO

/* =========================================================
   SEED DATA
   ========================================================= */

-- ROLES
INSERT INTO Role (RoleName)
VALUES ('Admin'), ('User');
GO

-- USERS
INSERT INTO [User] (Username, Email, PasswordHash, Salt, FirstName, LastName, RoleId)
VALUES
('admin123','admin@example.com','0rTDFx4kB16fD/C9vKhra1oZ0GPj47lbZra3Iyhn+yg=','0fs9ZLj5yJumBfbgfaqw9w==','Admin','User',1),
('user123','user@example.com','hash','salt','Regular','User',2),
('luka1','luka1@test.com','hash1','salt1','Luka','One',2),
('ana2','ana2@test.com','hash2','salt2','Ana','Two',2),
('marko3','marko3@test.com','hash3','salt3','Marko','Three',2),
('iva4','iva4@test.com','hash4','salt4','Iva','Four',2),
('petar5','petar5@test.com','hash5','salt5','Petar','Five',2);
GO

-- RESTAURANTS (REAL LOCATIONS FOR GOOGLE MAPS)
INSERT INTO Restaurant (Name, Address, City, Latitude, Longitude, WorkingHours)
VALUES
('Idle Central', 'Ilica 1', 'Zagreb', 45.8131, 15.9770, '08:00 - 23:00'),
('Bella Vista', 'Tkalčićeva 20', 'Zagreb', 45.8155, 15.9819, '09:00 - 22:00'),
('Urban Grill', 'Riva 10', 'Split', 43.5081, 16.4402, '10:00 - 00:00'),
('Sea Bite', 'Korzo 5', 'Rijeka', 45.3271, 14.4422, '11:00 - 23:30');
GO

-- TABLES
INSERT INTO [Table] (RestaurantId, Seats)
VALUES
(1, 4),
(1, 2),
(2, 2),
(2, 4),
(3, 4),
(3, 6),
(4, 2),
(4, 4);
GO

-- PROMOTIONS
INSERT INTO Promotion (RestaurantId, Title, DiscountPercent)
VALUES
(1, 'Happy Hour', 20.00),
(2, 'Lunch Deal', 15.00),
(3, 'Weekend Special', 10.00),
(4, 'Seafood Night', 25.00);
GO

-- RESERVATIONS (CONSISTENT STATUS)
INSERT INTO Reservation (UserId, RestaurantId, TableId, ReservationDateTime, PartySize, Status)
VALUES
(2, 1, 1, '2026-03-25 19:00:00', 2, 'Active'),
(3, 2, 4, '2026-03-26 18:00:00', 4, 'Active'),
(4, 2, 3, '2026-03-26 19:00:00', 2, 'Active'),
(5, 3, 5, '2026-03-27 20:00:00', 4, 'Pending'),
(6, 3, 6, '2026-03-28 17:30:00', 6, 'Cancelled'),
(7, 4, 7, '2026-03-29 21:00:00', 2, 'Active'),
(4, 4, 8, '2026-03-30 18:30:00', 4, 'Pending');
GO

-- NOTIFICATIONS
INSERT INTO Notification (UserId, Title, Message)
VALUES
(3, 'Reservation Confirmed', 'Your reservation at Idle Central is confirmed.'),
(4, 'New Promotion', 'Bella Vista currently offers a lunch deal.'),
(5, 'Reservation Reminder', 'Your reservation starts soon.'),
(6, 'Status Update', 'Your reservation is pending confirmation.');
GO

/* =========================================================
   CHECK DATA
   ========================================================= */

SELECT * FROM Role;
SELECT * FROM [User];
SELECT * FROM Restaurant;
SELECT * FROM [Table];
SELECT * FROM Promotion;
SELECT * FROM Reservation;
SELECT * FROM Notification;
GO