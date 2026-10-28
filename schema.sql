-- ====================================================================
-- BANCO DE DADOS: GEEKSHOP
-- ====================================================================

CREATE DATABASE IF NOT EXISTS geekshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE geekshop;

DROP TABLE IF EXISTS itens_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS categorias;

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    data_pedido DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

INSERT INTO categorias (id, nome) VALUES
(1, 'Periféricos & Hardware'),
(2, 'Vestuário Geek'),
(3, 'Colecionáveis'),
(4, 'Decoração');

INSERT INTO produtos (id, nome, descricao, preco, estoque, categoria_id) VALUES
(1, 'Mousepad Gamer Extra Grande 900x400mm', 'Superfície de tecido suave com base emborrachada', 89.90, 60, 1),
(2, 'Mouse Gamer RGB 16000 DPI', 'Sensor óptico de alta precisão com botões programáveis', 199.90, 45, 1),
(3, 'Headset Gamer 7.1 Surround', 'Driver de áudio potente e almofadas com isolamento acústico', 289.90, 25, 1),
(4, 'Teclado Gamer Mecânico Switch Blue', 'Estrutura reforçada em alumínio com teclas anti-ghosting', 349.00, 30, 1),
(5, 'Gabinete Gamer Vidro Temperado', 'Espaço amplo para cable management e 4 ventoinhas ARGB', 499.00, 22, 1),
(6, 'Action Figure Cyber Samurai', 'Estátua artesanal detalhada e numerada de 30cm', 850.00, 8, 3),
(7, 'Mesa Gamer com Suporte para Copo', 'Tampo com acabamento em fibra de carbono e porta headset', 899.90, 10, 1),
(8, 'Monitor Gamer Curvo 165Hz 1ms', 'Tela de 27 polegadas Full HD com tecnologia FreeSync', 1399.00, 18, 1),
(9, 'Cadeira Gamer Ergonômica Pro', 'Ajuste de altura a gás e encosto reclinável até 180°', 1450.00, 12, 1),
(10, 'Placa de Vídeo RTX 4080 Super Gamer', '16GB GDDR6X, Ray Tracing avançado e tecnologia DLSS 3', 7890.00, 5, 1),
(11, 'Caneca Código e Café', 'Caneca em cerâmica preta com acabamento fosco', 45.00, 100, 4),
(12, 'Chaveiro Geek Espada Lendária', 'Miniatura metálica fundida em alta definição', 29.90, 150, 3),
(13, 'Camiseta Dev Fullstack', 'Camiseta 100% algodão estampa terminal linux', 79.90, 80, 2),
(14, 'Luminária Pixel Art LED', 'Luminária USB decorativa com diversas cores', 129.90, 40, 4),
(15, 'Moletom Level Up', 'Moletom flanelado com capuz e bolso canguru', 199.00, 35, 2);

INSERT INTO clientes (id, nome, email, cidade) VALUES
(1, 'Lucas Silva', 'lucas@email.com', 'São Paulo'),
(2, 'Beatriz Santos', 'beatriz@email.com', 'São Paulo'),
(3, 'Gabriel Lima', 'gabriel@email.com', 'São Paulo'),
(4, 'Mariana Oliveira', 'mariana@email.com', 'São Paulo'),
(5, 'Rafael Alves', 'rafael@email.com', 'Rio de Janeiro'),
(6, 'Juliana Ferreira', 'juliana@email.com', 'Rio de Janeiro'),
(7, 'Thiago Costa', 'thiago@email.com', 'Rio de Janeiro'),
(8, 'Fernanda Souza', 'fernanda@email.com', 'Arapiraca'),
(9, 'Carlos Alberto', 'carlos@email.com', 'Arapiraca'),
(10, 'Ione Lira', 'ione@email.com', 'Arapiraca'),
(11, 'Matheus Henrique', 'matheus@email.com', 'Maceió'),
(12, 'Larissa Mendes', 'larissa@email.com', 'Maceió'),
(13, 'Rodrigo Barbosa', 'rodrigo@email.com', 'Recife'),
(14, 'Camila Rocha', 'camila@email.com', 'Recife'),
(15, 'Felipe Duarte', 'felipe@email.com', 'Belo Horizonte');

INSERT INTO pedidos (id, cliente_id, data_pedido, status) VALUES
(1, 1, '2026-01-15 10:30:00', 'Entregue'),
(2, 2, '2026-02-10 14:20:00', 'Cancelado'),
(3, 3, '2026-03-05 09:15:00', 'Entregue'),
(4, 4, '2026-03-22 16:40:00', 'Enviado'),
(5, 5, '2026-04-12 11:00:00', 'Entregue'),
(6, 6, '2026-04-28 18:30:00', 'Pendente'),
(7, 7, '2026-05-10 13:10:00', 'Entregue'),
(8, 8, '2026-05-25 15:45:00', 'Processando'),
(9, 9, '2026-06-02 08:20:00', 'Entregue'),
(10, 10, '2026-06-30 20:10:00', 'Entregue'),
(11, 11, '2026-07-14 17:00:00', 'Entregue'),
(12, 12, '2026-08-01 12:00:00', 'Pendente');

INSERT INTO itens_pedido (id, pedido_id, produto_id, quantidade, preco_unitario) VALUES
(1, 1, 11, 2, 45.00),
(2, 2, 2, 1, 199.90),
(3, 3, 9, 1, 1450.00),
(4, 4, 4, 1, 349.00),
(5, 5, 10, 1, 7890.00),
(6, 6, 3, 1, 289.90),
(7, 7, 8, 1, 1399.00),
(8, 8, 14, 1, 129.90),
(9, 9, 6, 1, 850.00),
(10, 10, 5, 1, 499.00),
(11, 11, 13, 1, 79.90),
(12, 12, 1, 1, 89.90);