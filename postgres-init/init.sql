-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Insert seed data
INSERT INTO users (name) VALUES
('Joseph'),
('Madelene'),
('Paul');