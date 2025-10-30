CREATE TABLE admins (
id INT IDENTITY PRIMARY KEY,
username NVARCHAR(100) NOT NULL UNIQUE,
password_hash NVARCHAR(255) NOT NULL -- simpan hashed password (bcrypt)
);


drop table users;
CREATE TABLE users (
id INT IDENTITY PRIMARY KEY,
name NVARCHAR(200) NOT NULL,
fingerprint_id NVARCHAR(100) NOT NULL UNIQUE,
photo_path NVARCHAR(500) NULL
);


drop table logs;

CREATE TABLE logs (
id INT IDENTITY PRIMARY KEY,
event_date DATE NOT NULL,
event_time TIME(0) NOT NULL,
user_name NVARCHAR(200) NULL, -- bisa 'Unknown'
fingerprint_id NVARCHAR(100) NULL,
note NVARCHAR(500) NULL
);
