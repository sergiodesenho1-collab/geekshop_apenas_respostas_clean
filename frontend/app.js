/**
 * ====================================================================
 * FRONTEND JAVASCRIPT — GEEKSHOP RESPOSTAS DIRETAS
 * ====================================================================
 * Consulta o backend imediatamente e preenche todos os dados na tela.
 */

let requisicaoEmAndamento = false;
let historicoGrafico = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarResultadosDasMissoes();
  // Consulta novamente o banco para refletir inclusões/exclusões feitas no HeidiSQL.
  setInterval(carregarResultadosDasMissoes, 3000);
  window.addEventListener('resize', desenharGrafico);
});

async function carregarResultadosDasMissoes() {
  if (requisicaoEmAndamento) return;
  requisicaoEmAndamento = true;
  const statusPill = document.getElementById('status-conexao');

  try {
    const res = await fetch('/api/respostas');
    const dados = await res.json();
    if (!res.ok || !dados.sucesso) throw new Error(dados.detalhe || dados.erro || 'Falha ao consultar o banco');

    if (dados.banco_conectado) {
      statusPill.textContent = 'Banco MySQL Conectado';
      statusPill.className = 'pill pill-online';
    } else {
      statusPill.textContent = 'Banco não conectado';
      statusPill.className = 'pill';
    }

    // MISSÃO 1
    document.getElementById('m1-clientes').textContent = dados.missao1.total_clientes;
    document.getElementById('m1-produtos').textContent = dados.missao1.total_produtos;
    document.getElementById('m1-pedidos').textContent = dados.missao1.total_pedidos;
    document.getElementById('m1-status-list').innerHTML = dados.missao1.status.map(s => 
      `<span class="tag-item">${s}</span>`
    ).join('');

    // MISSÃO 2
    document.getElementById('m2-maior').textContent = 'R$ ' + parseFloat(dados.missao2.maior_preco).toFixed(2);
    document.getElementById('m2-menor').textContent = 'R$ ' + parseFloat(dados.missao2.menor_preco).toFixed(2);
    document.getElementById('m2-dif').textContent = 'R$ ' + parseFloat(dados.missao2.diferenca_preco).toFixed(2);
    document.getElementById('m2-top10-corpo').innerHTML = dados.missao2.top10.map((p, idx) => `
      <tr>
        <td><span class="rank-tag">#${idx + 1}</span></td>
        <td><strong>${p.nome}</strong></td>
        <td class="price-text">R$ ${parseFloat(p.preco).toFixed(2)}</td>
      </tr>
    `).join('');

    // MISSÃO 3
    document.getElementById('m3-total').textContent = dados.missao3.total_gamer;
    document.getElementById('m3-produtos-corpo').innerHTML = dados.missao3.produtos.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td><strong>${p.nome}</strong></td>
        <td class="price-text">R$ ${parseFloat(p.preco).toFixed(2)}</td>
      </tr>
    `).join('');

    // MISSÃO 4
    if (dados.missao4.ranking.length > 0) {
      const top = dados.missao4.ranking[0];
      document.getElementById('m4-top-cidade').textContent = `${top.cidade} (${top.total_clientes} clientes)`;
    }
    document.getElementById('m4-cidades-corpo').innerHTML = dados.missao4.ranking.map((c, idx) => `
      <tr>
        <td><span class="rank-tag">Top ${idx + 1}</span></td>
        <td><strong>${c.cidade}</strong></td>
        <td><span class="pill-count">${c.total_clientes} clientes</span></td>
      </tr>
    `).join('');

    // MISSÃO 5
    document.getElementById('m5-pedidos').textContent = dados.missao5.total_pedidos;
    document.getElementById('m5-valor').textContent = 'R$ ' + parseFloat(dados.missao5.valor_total).toFixed(2);

    // MISSÃO 6
    document.getElementById('m6-corpo').innerHTML = (dados.missao6 || []).map((p, i) => `
      <tr><td><span class="rank-tag">Top ${i + 1}</span></td><td><strong>${p.nome}</strong></td><td>${p.unidades}</td></tr>
    `).join('');

    // MISSÃO 7
    document.getElementById('m7-total').textContent = dados.missao7.total_pedidos;
    document.getElementById('m7-valor').textContent = 'R$ ' + Number(dados.missao7.valor_total).toFixed(2);
    document.getElementById('m7-clientes').innerHTML = dados.missao7.clientes.map(c => `<span class="tag-item">${c}</span>`).join('');

    // MISSÃO 8
    document.getElementById('m8-corpo').innerHTML = dados.missao8.map(c => `
      <tr><td><strong>${c.nome}</strong></td><td class="price-text">R$ ${Number(c.total_gasto).toFixed(2)}</td></tr>
    `).join('');

    // MISSÃO 9
    if (dados.missao9.length) document.getElementById('m9-top').textContent = `${dados.missao9[0].categoria} — R$ ${Number(dados.missao9[0].faturamento).toFixed(2)}`;
    document.getElementById('m9-corpo').innerHTML = dados.missao9.map(c => `
      <tr><td><strong>${c.categoria}</strong></td><td class="price-text">R$ ${Number(c.faturamento).toFixed(2)}</td></tr>
    `).join('');

    // MISSÃO 10
    document.getElementById('m10-clientes').innerHTML = dados.missao10.clientes.map((c, i) => `
      <tr><td><span class="rank-tag">Top ${i + 1}</span></td><td><strong>${c.nome}</strong></td><td class="price-text">R$ ${Number(c.total_gasto).toFixed(2)}</td></tr>
    `).join('');
    document.getElementById('m10-produtos').innerHTML = dados.missao10.produtos.map((p, i) => `
      <tr><td><span class="rank-tag">Top ${i + 1}</span></td><td><strong>${p.nome}</strong></td><td>${p.unidades}</td></tr>
    `).join('');
    document.getElementById('m10-categorias').innerHTML = dados.missao10.categorias.map(c => `
      <tr><td><strong>${c.categoria}</strong></td><td class="price-text">R$ ${Number(c.faturamento).toFixed(2)}</td></tr>
    `).join('');
    document.getElementById('m10-recomendacoes').innerHTML = dados.missao10.recomendacoes.map(r => `<span class="tag-item">${r}</span>`).join('');

    // Gráfico baseado nos totais reais devolvidos pelo banco.
    const ponto = {
      horario: new Date().toLocaleTimeString('pt-BR'),
      clientes: Number(dados.missao1.total_clientes) || 0,
      produtos: Number(dados.missao1.total_produtos) || 0,
      pedidos: Number(dados.missao1.total_pedidos) || 0
    };
    historicoGrafico.push(ponto);
    if (historicoGrafico.length > 12) historicoGrafico.shift();
    desenharGrafico();
    const atualizado = document.getElementById('grafico-atualizado');
    if (atualizado) atualizado.textContent = `Última atualização: ${ponto.horario} — consulta automática a cada 3 segundos.`;


  } catch (err) {
    console.error('Erro na requisição:', err);
    statusPill.textContent = 'Erro de conexão com banco';
    statusPill.className = 'pill';
    const atualizado = document.getElementById('grafico-atualizado');
    if (atualizado) atualizado.textContent = `Não foi possível atualizar: ${err.message}`;
  } finally {
    requisicaoEmAndamento = false;
  }
}

// Desenha o gráfico sem bibliotecas externas e preserva o visual da página.
function desenharGrafico() {
  const canvas = document.getElementById('grafico-tempo-real');
  if (!canvas || !historicoGrafico.length) return;
  const ctx = canvas.getContext('2d');
  const larguraCss = canvas.clientWidth || 600;
  const alturaCss = 260;
  const escala = window.devicePixelRatio || 1;
  canvas.width = larguraCss * escala;
  canvas.height = alturaCss * escala;
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
  ctx.clearRect(0, 0, larguraCss, alturaCss);

  const estilos = getComputedStyle(document.body);
  const texto = estilos.color || '#e8edf5';
  const linhas = 'rgba(140,160,185,0.18)';
  const series = [
    { chave: 'clientes', nome: 'Clientes', cor: '#4dd0e1' },
    { chave: 'produtos', nome: 'Produtos', cor: '#b39ddb' },
    { chave: 'pedidos', nome: 'Pedidos', cor: '#81c784' }
  ];
  const margem = { topo: 28, direita: 18, baixo: 42, esquerda: 42 };
  const areaW = larguraCss - margem.esquerda - margem.direita;
  const areaH = alturaCss - margem.topo - margem.baixo;
  const maximo = Math.max(10, ...historicoGrafico.flatMap(p => [p.clientes, p.produtos, p.pedidos])) * 1.15;

  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const y = margem.topo + areaH - (areaH * i / 4);
    ctx.strokeStyle = linhas;
    ctx.beginPath(); ctx.moveTo(margem.esquerda, y); ctx.lineTo(larguraCss - margem.direita, y); ctx.stroke();
    ctx.fillStyle = texto;
    ctx.fillText(Math.round(maximo * i / 4), margem.esquerda - 8, y);
  }

  const passo = historicoGrafico.length > 1 ? areaW / (historicoGrafico.length - 1) : 0;
  series.forEach(serie => {
    ctx.strokeStyle = serie.cor;
    ctx.fillStyle = serie.cor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    historicoGrafico.forEach((p, i) => {
      const x = margem.esquerda + (historicoGrafico.length > 1 ? i * passo : areaW / 2);
      const y = margem.topo + areaH - (p[serie.chave] / maximo) * areaH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
    });
    ctx.stroke();
  });

  // Legenda
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  let lx = margem.esquerda;
  series.forEach(serie => {
    ctx.fillStyle = serie.cor;
    ctx.fillRect(lx, alturaCss - 17, 10, 10);
    ctx.fillStyle = texto;
    ctx.fillText(serie.nome, lx + 15, alturaCss - 8);
    lx += 95;
  });
}