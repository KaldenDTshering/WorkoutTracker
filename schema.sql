CREATE DATABASE IF NOT EXISTS workout_tracker; 
USE workout_tracker; 

CREATE TABLE IF NOT EXISTS workout_tracker (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date VARCHAR(10),
    name varchar(100),
    cat VARCHAR(20),
    sets INT DEFAULT 0,
    reps INT DEFAULT 0,
    weight DECIMAL(6,2) DEFAULT 0,
    dur DECIMAL(6,2) DEFAULT 0,
    dist DECIMAL(6,2) DEFAULT 0,
    pace VARCHAR(10) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);