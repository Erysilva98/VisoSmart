import { useState } from 'react';
import { BookOpen, CalendarDays, ChartPie, Copyright, ExternalLink, Flag, Monitor, Plus, ReceiptText, Share2, SlidersHorizontal, Smartphone, Tablet, Target } from 'lucide-react';
import { APP_BUILD, APP_VERSION } from '@/lib/appVersion';
import { Dialog } from './Dialog';

const PUBLIC_APP_URL = 'https://erysilva98.github.io/TCC/';
const help = [
  { Icon: Plus, title: 'Registrar seu dinheiro', text: 'Toque no +, escolha Entrada ou Despesa, a categoria e o valor. Registre apenas dinheiro recebido ou gastos já realizados.' },
  { Icon: ReceiptText, title: 'Consultar o Extrato', text: 'Veja seus registros e filtre por tipo, categoria, dia ou período. Toque em um registro para conferir ou corrigir as informações.' },
  { Icon: CalendarDays, title: 'Explorar o calendário', text: 'Toque em um dia com registros para abrir os gastos no Extrato. Nas telas menores, a seta abre o mês completo; toque novamente para recolher.' },
  { Icon: ChartPie, title: 'Entender seus gastos', text: 'No Início, confira o saldo, o total gasto e sua maior categoria. A seta em Gastos por categoria mostra as demais categorias.' },
  { Icon: SlidersHorizontal, title: 'Categorias e limites', text: 'No Perfil, escolha ou crie suas categorias. Em Meus limites, defina um teto por categoria e acompanhe a barra: vermelha significa que o limite foi atingido.' },
  { Icon: Target, title: 'Planejar uma meta', text: 'Escolha um objetivo, valor e prazo. Veja a previsão de aportes e use Guardar para separar dinheiro disponível para a meta.' },
  { Icon: BookOpen, title: 'Seguir a trilha', text: 'Em Aprender, leia o conceito, responda à pergunta e realize a atividade no app. A seta mostra as etapas da sua trilha.' },
  { Icon: Flag, title: 'Missões e conquistas', text: 'No Perfil, abra as missões do mês e acompanhe seu progresso. O troféu reúne suas missões concluídas, metas alcançadas e etapas da trilha.' },
];

export function ProfileInfoDialog({ kind, onClose }: { kind: 'about' | 'help'; onClose: () => void }) {
  const [notice, setNotice] = useState('');
  const [sharing, setSharing] = useState(false);
  async function share() {
    setSharing(true); setNotice('');
    try {
      if (navigator.share) {
        try { await navigator.share({ title: 'Viso Smart', text: 'Conheça o Viso Smart: veja melhor, planeje melhor.', url: PUBLIC_APP_URL }); return; }
        catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
      }
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(PUBLIC_APP_URL); setNotice('Link copiado! Cole onde quiser compartilhar.'); }
      else setNotice('Copie o endereço abaixo para compartilhar.');
    } catch { setNotice('Não foi possível copiar automaticamente. Copie o endereço abaixo.'); }
    finally { setSharing(false); }
  }
  return <Dialog title={kind === 'help' ? 'Ajudar · como usar o Viso Smart' : 'Sobre o Viso Smart'} onClose={onClose}>
    {kind === 'help' ? <div className="space-y-3"><p className="text-sm text-ink-600">Um guia rápido para cuidar do seu dinheiro, um passo de cada vez.</p>{help.map(({ Icon, title, text }) => <section key={title} className="flex gap-3 rounded-xl border border-ink-100 p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><Icon className="h-4 w-4" /></span><div><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-ink-600">{text}</p></div></section>)}</div> : <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-600">Veja melhor, planeje melhor. Educação financeira e organização para acompanhar suas escolhas e seus objetivos.</p>
      <div className="rounded-xl bg-violet-50 p-3"><p className="flex items-center gap-2 text-sm font-semibold"><Copyright aria-label="Copyright" className="h-4 w-4 text-violet-700" />2026 Erimilson Silva</p><p className="mt-2 text-xs text-ink-600">Versão {APP_VERSION} · Build {APP_BUILD}</p></div>
      <section><h3 className="text-xs font-semibold">Compatibilidade</h3><ul className="mt-2 flex flex-wrap gap-2 text-xs text-ink-600">{[{ Icon: Smartphone, label: 'Android' }, { Icon: Tablet, label: 'Tablets' }, { Icon: Monitor, label: 'Windows 11' }].map(({ Icon, label }) => <li key={label} className="flex items-center gap-1.5 rounded-lg bg-ink-50 px-2 py-2"><Icon className="h-4 w-4 text-primary-700" />{label}</li>)}</ul><p className="mt-2 text-xs leading-relaxed text-ink-600">Use pelo navegador ou instale como aplicativo (PWA), quando essa opção estiver disponível.</p></section>
      <a href={PUBLIC_APP_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-ink-200 p-3 text-xs font-semibold text-primary-700">Abrir versão pública<ExternalLink className="h-4 w-4 shrink-0" /></a>
      <button type="button" onClick={share} disabled={sharing} className="btn-primary w-full gap-2"><Share2 className="h-4 w-4" />{sharing ? 'Compartilhando…' : 'Compartilhar o Viso Smart'}</button>
      <p className="select-all break-all text-center text-xs text-ink-500">{PUBLIC_APP_URL}</p>
      {notice && <p role="status" className="text-xs text-primary-700">{notice}</p>}
    </div>}
  </Dialog>;
}
