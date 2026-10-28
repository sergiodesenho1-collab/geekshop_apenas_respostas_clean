/**
 * GEEKSHOP — backend das 10 missões
 * Todos os números e listas vêm do banco loja_geek. Não existem respostas fictícias.
 */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'geekshop_app',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'loja_geek',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  decimalNumbers: true
});

app.get('/api/saude', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS banco, VERSION() AS versao');
    const [counts] = await pool.query('SELECT COUNT(*) AS total_clientes FROM clientes');
    res.json({ conectado: true, banco: rows[0].banco, versao: rows[0].versao, total_clientes: counts[0].total_clientes });
  } catch (error) {
    res.status(500).json({ conectado: false, erro: error.message });
  }
});

app.get('/api/respostas', async (req, res) => {
  try {
    // Confirma quais colunas de categoria existem no banco real, sem presumir um formato.
    const [produtoCols] = await pool.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos'
    `);
    const colunasProduto = new Set(produtoCols.map(r => r.COLUMN_NAME));
    let sqlCategorias;
    if (colunasProduto.has('categoria')) {
      sqlCategorias = `
        SELECT p.categoria AS categoria, SUM(ip.quantidade * ip.preco_unitario) AS faturamento
        FROM produtos p
        INNER JOIN itens_pedido ip ON ip.produto_id = p.id
        INNER JOIN pedidos pe ON pe.id = ip.pedido_id
        WHERE pe.status = 'Entregue'
        GROUP BY p.categoria
        ORDER BY faturamento DESC`;
    } else if (colunasProduto.has('categoria_id')) {
      sqlCategorias = `
        SELECT COALESCE(c.nome, 'Sem categoria') AS categoria,
               SUM(ip.quantidade * ip.preco_unitario) AS faturamento
        FROM produtos p
        LEFT JOIN categorias c ON c.id = p.categoria_id
        INNER JOIN itens_pedido ip ON ip.produto_id = p.id
        INNER JOIN pedidos pe ON pe.id = ip.pedido_id
        WHERE pe.status = 'Entregue'
        GROUP BY p.categoria_id, c.nome
        ORDER BY faturamento DESC`;
    } else {
      throw new Error('A tabela produtos precisa ter a coluna categoria ou categoria_id.');
    }

    // Missão 1 — totais reais e status existentes.
    const [[clientes]] = await pool.query('SELECT COUNT(*) AS total_clientes FROM clientes');
    const [[produtos]] = await pool.query('SELECT COUNT(*) AS total_produtos FROM produtos');
    const [[pedidos]] = await pool.query('SELECT COUNT(*) AS total_pedidos FROM pedidos');
    const [status] = await pool.query('SELECT DISTINCT status FROM pedidos ORDER BY status');

    // Missão 2 — faixa de preço e dez produtos mais caros.
    const [top10] = await pool.query('SELECT id, nome, preco FROM produtos ORDER BY preco DESC LIMIT 10');
    const [[faixaPreco]] = await pool.query(`
      SELECT MAX(preco) AS maior_preco, MIN(preco) AS menor_preco,
             COALESCE(MAX(preco) - MIN(preco), 0) AS diferenca_preco
      FROM produtos`);

    // Missão 3 — produtos cujo nome contém Gamer.
    const [gamer] = await pool.query(`
      SELECT id, nome, preco FROM produtos
      WHERE nome LIKE '%Gamer%' ORDER BY preco ASC`);

    // Missão 4 — cinco cidades com mais clientes.
    const [cidades] = await pool.query(`
      SELECT cidade, COUNT(*) AS total_clientes FROM clientes
      GROUP BY cidade ORDER BY total_clientes DESC, cidade ASC LIMIT 5`);

    // Missão 5 — pedidos entre 1º de março e antes de 1º de julho de 2026.
    const [[periodo]] = await pool.query(`
      SELECT COUNT(DISTINCT pe.id) AS total_pedidos,
             COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0) AS valor_total
      FROM pedidos pe
      LEFT JOIN itens_pedido ip ON ip.pedido_id = pe.id
      WHERE pe.data_pedido >= '2026-03-01' AND pe.data_pedido < '2026-07-01'`);

    // Missão 6 — cinco produtos mais vendidos em pedidos entregues.
    const [m6] = await pool.query(`
      SELECT p.nome, SUM(ip.quantidade) AS unidades
      FROM produtos p
      INNER JOIN itens_pedido ip ON ip.produto_id = p.id
      INNER JOIN pedidos pe ON pe.id = ip.pedido_id
      WHERE pe.status = 'Entregue'
      GROUP BY p.id, p.nome ORDER BY unidades DESC, p.nome ASC LIMIT 5`);

    // Missão 7 — pedidos cancelados, valor dos itens e clientes afetados.
    const [[cancelados]] = await pool.query(`
      SELECT COUNT(DISTINCT pe.id) AS total_pedidos,
             COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0) AS valor_total
      FROM pedidos pe LEFT JOIN itens_pedido ip ON ip.pedido_id = pe.id
      WHERE pe.status = 'Cancelado'`);
    const [clientesCancelados] = await pool.query(`
      SELECT DISTINCT c.nome FROM clientes c
      INNER JOIN pedidos pe ON pe.cliente_id = c.id
      WHERE pe.status = 'Cancelado' ORDER BY c.nome`);

    // Missão 8 — clientes que gastaram mais de R$ 3.000 em pedidos entregues.
    const [vip] = await pool.query(`
      SELECT c.nome, SUM(ip.quantidade * ip.preco_unitario) AS total_gasto
      FROM clientes c
      INNER JOIN pedidos pe ON pe.cliente_id = c.id
      INNER JOIN itens_pedido ip ON ip.pedido_id = pe.id
      WHERE pe.status = 'Entregue'
      GROUP BY c.id, c.nome
      HAVING SUM(ip.quantidade * ip.preco_unitario) > 3000
      ORDER BY total_gasto DESC`);

    // Missão 9 — faturamento por categoria (consulta adaptada à estrutura real).
    const [m9] = await pool.query(sqlCategorias);

    // Missão 10 — resumo executivo.
    const [topClientes] = await pool.query(`
      SELECT c.nome, SUM(ip.quantidade * ip.preco_unitario) AS total_gasto
      FROM clientes c
      INNER JOIN pedidos pe ON pe.cliente_id = c.id
      INNER JOIN itens_pedido ip ON ip.pedido_id = pe.id
      WHERE pe.status = 'Entregue'
      GROUP BY c.id, c.nome ORDER BY total_gasto DESC LIMIT 5`);
    const [topProdutos] = await pool.query(`
      SELECT p.nome, SUM(ip.quantidade) AS unidades
      FROM produtos p
      INNER JOIN itens_pedido ip ON ip.produto_id = p.id
      INNER JOIN pedidos pe ON pe.id = ip.pedido_id
      WHERE pe.status = 'Entregue'
      GROUP BY p.id, p.nome ORDER BY unidades DESC, p.nome ASC LIMIT 3`);

    res.json({
      sucesso: true,
      banco_conectado: true,
      atualizado_em: new Date().toISOString(),
      missao1: { total_clientes: clientes.total_clientes, total_produtos: produtos.total_produtos, total_pedidos: pedidos.total_pedidos, status: status.map(r => r.status) },
      missao2: { ...faixaPreco, top10 },
      missao3: { total_gamer: gamer.length, produtos: gamer },
      missao4: { ranking: cidades },
      missao5: { total_pedidos: periodo.total_pedidos, valor_total: periodo.valor_total },
      missao6: m6,
      missao7: { total_pedidos: cancelados.total_pedidos, valor_total: cancelados.valor_total, clientes: clientesCancelados.map(r => r.nome) },
      missao8: vip,
      missao9: m9,
      missao10: {
        clientes: topClientes,
        produtos: topProdutos,
        categorias: m9,
        recomendacoes: [
          'Priorizar a divulgação dos produtos com maior volume de vendas.',
          'Criar campanhas para clientes que mais gastam na loja.',
          'Revisar estoque e campanhas com base no faturamento real por categoria.'
        ]
      }
    });
  } catch (error) {
    console.error('Erro consultando o banco loja_geek:', error.message);
    res.status(500).json({
      sucesso: false,
      banco_conectado: false,
      erro: 'A consulta ao banco falhou. Nenhum dado demonstrativo foi exibido.',
      detalhe: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`GeekShop ativo em http://localhost:${PORT}`);
  console.log(`Banco configurado: ${process.env.DB_NAME || 'loja_geek'}`);
});
