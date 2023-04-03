-- Active: 1680539826873@@127.0.0.1@3306

-- Criando USER sem o TIMES
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL
  
);

CREATE INDEX emailIndex ON usuarios(email);

SELECT * FROM usuarios;

-- Populando minha tabela ADD
INSERT INTO usuarios (email, senha) VALUES
  ('JoaodoGas@gmail.com', 'batatinha'),
  ('NetãodoEspeto@gmail.com', 'batatinha2'),
  ('ZeDoSantoForte@gmail.com', 'batatinha3');

-- Criando com TIMES 
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO products (name, price, category_id) VALUES
  ('Funko do HarryPother', 89.90, 1),
  ('Melancia da tia Nena', 29.90, 2),
  ('Relogio do Ben 10', 9999.00, 3);

INSERT INTO products (name, price, category_id) VALUES ('Máscara do Zorro', 19.90, 4);

  SELECT * FROM products;



