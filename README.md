# 🎮 GEEKSHOP — Apenas os Resultados das 10 Missões SQL

Projeto simplificado ao máximo para atender exatamente ao seu pedido:
- **Sem barra de pesquisa**
- **Sem abas que travam em "Carregando..."**
- **Todas as respostas aparecem diretamente na tela ao abrir a página**
- **Novo estilo de cores moderno e limpo**

---

## 🎯 O que a tela exibe diretamente:
1. **Missão 1**: Número total de clientes, produtos, pedidos e tags dos status únicos (`DISTINCT`).
2. **Missão 2**: Preço do produto mais caro (`MAX`), mais barato (`MIN`), a diferença entre eles e a tabela com o TOP 10 mais caros.
3. **Missão 3**: Quantidade e a lista dos produtos com a palavra "Gamer", ordenados do menor para o maior preço.
4. **Missão 4**: A cidade com mais clientes e a tabela com o Top 5 cidades com mais cadastros.
5. **Missão 5**: A quantidade de pedidos feitos entre março e junho de 2026 e a soma total acumulada em reais.

---

## 🚀 Como Executar:
1. No **XAMPP**, inicie o **MySQL**.
2. No **phpMyAdmin**, importe o arquivo **`schema.sql`** (caso ainda não tenha criado).
3. Abra a pasta `backend` no terminal e execute:
   ```bash
   npm install
   npm start
   ```
4. Acesse no navegador:
   👉 **`http://localhost:3000`**

## Missões 6 a 10
6. Campeões de vendas: cinco produtos com mais unidades vendidas em pedidos entregues.
7. Cancelamentos: quantidade, valor total e clientes afetados.
8. Clube VIP: clientes que gastaram mais de R$ 3.000,00 em pedidos entregues.
9. Categoria dominante: faturamento por categoria em pedidos entregues.
10. Relatório final: cinco clientes que mais gastaram, três produtos mais vendidos, faturamento por categoria e três recomendações.


## Configuração para consultar seu banco real (HeidiSQL / MariaDB)

1. Abra `backend/.env`.
2. Confirme `DB_NAME=loja_geek` e `DB_USER=root`.
3. Preencha `DB_PASSWORD=` com a mesma senha usada para conectar no HeidiSQL. Se sua senha for, por exemplo, `minhasenha`, a linha fica `DB_PASSWORD=minhasenha`. Não compartilhe sua senha.
4. No terminal, entre na pasta `backend` e execute `npm install` (somente na primeira vez) e depois `npm start`.
5. Abra `http://localhost:3000`.

A página consulta o banco a cada 3 segundos. Os números e o gráfico se atualizam quando clientes, produtos ou pedidos forem inseridos/excluídos diretamente no banco. Se a conexão falhar, a página mostra o erro em vez de apresentar respostas fictícias. A consulta da categoria usa a coluna `produtos.categoria`.
