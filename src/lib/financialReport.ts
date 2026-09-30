import { jsPDF } from 'jspdf';
import type { AppState, CategoryId } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { recordedMoney } from './financialSummary';
import { initialBalanceValue } from './personalization';
import { formatCurrency } from './format';

const formatDate = (value: string) => new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('pt-BR');

export function createFinancialReport(state: AppState) {
  const doc = new jsPDF({ compress: true });
  doc.setProperties({ title: 'Nexo - Relatório financeiro', author: 'Nexo', subject: 'Saldo, metas e registros financeiros' });
  let y = 20;
  const money = (amount: number) => formatCurrency(amount).replace(/\u00a0/g, ' ');
  function pageSpace(height: number) { if (y + height > 276) { doc.addPage(); y = 20; } }
  function text(value: string, size = 10, bold = false) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor('#111936');
    const lines: string[] = doc.splitTextToSize(value, 174);
    for (const line of lines) { pageSpace(size * 0.45 + 2); doc.text(line, 18, y); y += size * 0.45 + 1.5; }
  }
  function heading(value: string) { pageSpace(22); y += 5; text(value, 14, true); y += 2; }
  text('Nexo', 24, true);
  text('Seu relatório financeiro', 16);
  text(`Emitido em ${new Date().toLocaleDateString('pt-BR')} · Todo o histórico registrado`, 9);
  const ordered = [...state.transactions].sort((a, b) => a.data.localeCompare(b.data));
  if (ordered.length) text(`Período: ${formatDate(ordered[0].data)} a ${formatDate(ordered[ordered.length - 1].data)}`, 9);
  const balance = recordedMoney(state.transactions, state.goals, state.openingBalance);
  const income = state.transactions.filter((item) => item.tipo === 'receita' && item.origem !== 'saldo_inicial').reduce((total, item) => total + Math.round(item.valor * 100), 0) / 100;
  const groups = new Map<CategoryId, number>();
  state.transactions.filter((item) => item.tipo === 'despesa' && item.valor > 0).forEach((item) => groups.set(item.categoria, (groups.get(item.categoria) ?? 0) + Math.round(item.valor * 100)));
  const categories = [...groups].sort((a, b) => b[1] - a[1]);
  const expense = categories.reduce((total, [, cents]) => total + cents, 0) / 100;
  heading('Saldo e movimentações');
  text(`Saldo inicial: ${money(initialBalanceValue(state.transactions, state.openingBalance))}`);
  text(`Receitas registradas, sem saldo inicial: ${money(income)}`);
  text(`Despesas registradas: ${money(expense)}`);
  text(`Dinheiro total até hoje: ${money(balance.total)} · Reservado: ${money(balance.reserved)}`);
  text(`Saldo livre até hoje: ${money(balance.available)}`, 11, true);
  text('Totais de receitas e despesas incluem todo o histórico; o saldo disponível considera apenas registros até hoje. Reservas em metas não são novas despesas.', 9);
  heading('Metas e progresso');
  if (!state.goals.length) text('Nenhuma meta cadastrada.');
  state.goals.forEach((goal) => {
    pageSpace(38);
    const percent = goal.valorAlvo > 0 ? Math.min(100, goal.valorAtual / goal.valorAlvo * 100) : 0;
    text(`${goal.titulo} — ${percent.toFixed(1).replace('.', ',')}% concluído`, 11, true);
    text(`Guardado: ${money(goal.valorAtual)} de ${money(goal.valorAlvo)}. Falta: ${money(Math.max(0, goal.valorAlvo - goal.valorAtual))}.`);
    text(goal.prazo ? `Prazo: ${formatDate(goal.prazo)}` : goal.meses ? `Planejamento: ${goal.meses} meses` : 'Prazo não definido.', 9);
    doc.setFillColor('#E7EAF3'); doc.roundedRect(18, y, 174, 2, 1, 1, 'F');
    if (percent > 0) { doc.setFillColor('#2476ce'); doc.rect(18, y, 174 * percent / 100, 2, 'F'); }
    y += 8;
  });
  heading('Gastos por categoria');
  if (!categories.length) text('Nenhuma despesa registrada.');
  else {
    pageSpace(70);
    const centerX = 105, centerY = y + 30, radius = 27;
    let angle = -Math.PI / 2;
    for (const [id, cents] of categories) {
      const end = angle + cents / (expense * 100) * Math.PI * 2;
      doc.setFillColor(CATEGORIES[id].cor); doc.setDrawColor(CATEGORIES[id].cor);
      while (angle < end) {
        const next = Math.min(end, angle + Math.PI / 90);
        doc.triangle(centerX, centerY, centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius, centerX + Math.cos(next) * radius, centerY + Math.sin(next) * radius, 'F');
        angle = next;
      }
    }
    doc.setFillColor('#FFFFFF'); doc.circle(centerX, centerY, 15, 'F'); y += 65;
    categories.forEach(([id, cents]) => text(`${CATEGORIES[id].nome}: ${(cents / (expense * 100) * 100).toFixed(1).replace('.', ',')}% · ${money(cents / 100)}`));
  }
  heading('Relatório de gastos e entradas');
  text('Data · Tipo · Categoria · Valor; descrição abaixo de cada registro.', 9);
  if (!ordered.length) text('Nenhum registro cadastrado.');
  ordered.forEach((item) => {
    pageSpace(24);
    text(`${formatDate(item.data)} · ${item.origem === 'saldo_inicial' ? 'Saldo inicial' : item.origem === 'meta_aporte' ? 'Reserva para meta' : item.origem === 'meta_saque' ? 'Saque da meta' : item.tipo === 'receita' ? 'Entrada' : 'Despesa'} · ${CATEGORIES[item.categoria].nome} · ${money(item.valor)}`, 10, true);
    if (item.descricao) text(item.descricao, 9);
    y += 2;
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor('#667085');
    doc.text(`Nexo · Dados deste dispositivo · ${page}/${pages}`, 18, 287);
  }
  return doc;
}

export function downloadFinancialReport(state: AppState) {
  createFinancialReport(state).save(`nexo-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`);
}
