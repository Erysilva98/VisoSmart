import type { ProfileType } from '@/types';

export interface Lesson {
  id: string;
  titulo: string;
  descricao: string;
  duracao: string;
  xp: number;
  perfil: ProfileType[] | 'all';
  conteudo: string;
  desafio: string;
  nivel?: number;
  modulo?: string;
  desafioPratico?: { tipo: string; descricao: string; validacao: string; rota: string };
}

export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    titulo: 'O que Ã© orÃ§amento pessoal?',
    descricao: 'Aprenda a base de qualquer vida financeira saudÃ¡vel.',
    duracao: '3 min',
    xp: 15,
    perfil: ['explorer', 'equilibrado'],
    desafio: 'completar_aula',
    conteudo: 'OrÃ§amento Ã© o planejamento de quanto vocÃª ganha e quanto gasta. O primeiro passo Ã© saber exatamente para onde seu dinheiro vai. Anote tudo por um mÃªs e vocÃª jÃ¡ terÃ¡ mais controle que 90% das pessoas.',
  },
  {
    id: 'l2',
    titulo: 'DiferenÃ§a entre necessidade e desejo',
    descricao: 'Aprenda a identificar gastos impulsivos.',
    duracao: '4 min',
    xp: 15,
    perfil: ['explorer', 'equilibrado'],
    desafio: 'completar_aula',
    conteudo: 'Necessidade Ã© algo essencial (alimentaÃ§Ã£o, moradia, saÃºde). Desejo Ã© algo que melhora sua vida mas nÃ£o Ã© essencial (lazer, roupas extras). Antes de comprar, pergunte: preciso mesmo disso agora?',
  },
  {
    id: 'l3',
    titulo: 'Como criar uma reserva de emergÃªncia',
    descricao: 'O primeiro passo para seguranÃ§a financeira.',
    duracao: '5 min',
    xp: 15,
    perfil: ['equilibrado', 'construtor'],
    desafio: 'completar_aula',
    conteudo: 'Reserva de emergÃªncia Ã© um valor guardado para imprevistos. O ideal Ã© ter de 3 a 6 meses de despesas guardados. Comece pequeno: guarde R$ 100 por semana e jÃ¡ terÃ¡ R$ 400 em um mÃªs.',
  },
  {
    id: 'l4',
    titulo: 'Entendendo investimentos bÃ¡sicos',
    descricao: 'Renda fixa, Tesouro Direto e os primeiros passos.',
    duracao: '6 min',
    xp: 15,
    perfil: ['construtor', 'estrategista'],
    desafio: 'completar_aula',
    conteudo: 'Investir Ã© fazer seu dinheiro trabalhar por vocÃª. A renda fixa (Tesouro Direto, CDB) Ã© o ponto de partida: baixo risco e rendimento previsÃ­vel. Comece com o que sobra do orÃ§amento, mesmo que seja pouco.',
  },
  {
    id: 'l5',
    titulo: 'AnÃ¡lise de gastos por categoria',
    descricao: 'Como identificar gargalos no seu orÃ§amento.',
    duracao: '5 min',
    xp: 15,
    perfil: ['construtor', 'estrategista'],
    desafio: 'completar_aula',
    conteudo: 'Analise seus gastos por categoria nos Ãºltimos 3 meses. Procure categorias que cresceram sem vocÃª perceber. Reduzir 10% em uma categoria jÃ¡ gera economia significativa ao longo do ano.',
  },
  {
    id: 'l6',
    titulo: 'Planejamento financeiro de longo prazo',
    descricao: 'Metas de 1, 5 e 10 anos.',
    duracao: '7 min',
    xp: 15,
    perfil: ['construtor', 'estrategista'],
    desafio: 'completar_aula',
    conteudo: 'Planejamento de longo prazo envolve definir onde quer estar financeiramente em 5 e 10 anos. Divida metas grandes em pequenas. Revise trimestralmente. Ajuste conforme a realidade muda.',
  },
  {
    id: 'l7',
    titulo: 'OtimizaÃ§Ã£o de gastos',
    descricao: 'TÃ©cnicas avanÃ§adas para reduzir despesas.',
    duracao: '6 min',
    xp: 15,
    perfil: ['estrategista'],
    desafio: 'completar_aula',
    conteudo: 'OtimizaÃ§Ã£o vai alÃ©m de cortar: Ã© renegociar tarifas, trocar serviÃ§os por equivalentes mais baratos, agrupar assinaturas. Analise cada despesa recorrente e pergunte: existe forma mais barata de ter o mesmo resultado?',
  },
  {
    id: 'l8',
    titulo: 'Construindo patrimÃ´nio',
    descricao: 'DiversificaÃ§Ã£o e crescimento de patrimÃ´nio.',
    duracao: '8 min',
    xp: 15,
    perfil: ['construtor', 'estrategista'],
    desafio: 'completar_aula',
    conteudo: 'PatrimÃ´nio Ã© tudo o que vocÃª possui. Para crescer: diversifique entre imÃ³veis, investimentos e negÃ³cios. Reinvista parte dos ganhos. Tempo e consistÃªncia sÃ£o mais importantes que o valor inicial.',
  },
];

export function getLessonsForProfile(profile: ProfileType): Lesson[] {
  return TRACK_LESSONS.filter((l) => l.perfil === 'all' || l.perfil.includes(profile));
}

const TRACKS: Record<ProfileType, { modules: string[]; topics: string[]; tasks: { tipo: string; descricao: string; validacao: string; rota: string }[] }> = {
  explorer: { modules: ['Conhecendo meu dinheiro', 'Consumo consciente', 'Primeiro planejamento'], topics: ['Controle financeiro', 'Para onde meu dinheiro vai', 'Receita x despesa', 'Necessidade e desejo', 'HÃ¡bitos financeiros', 'Metas iniciais'], tasks: [{ tipo: 'transacao', descricao: 'Registre uma transaÃ§Ã£o no app.', validacao: 'transacao', rota: '/gastos' }, { tipo: 'categoria', descricao: 'Registre despesas em duas categorias.', validacao: 'categorias', rota: '/gastos' }, { tipo: 'meta', descricao: 'Crie sua primeira meta.', validacao: 'meta', rota: '/metas' }] },
  equilibrado: { modules: ['OrÃ§amento mensal', 'OrganizaÃ§Ã£o financeira', 'Reserva e acompanhamento'], topics: ['OrÃ§amento', 'Categorias financeiras', 'Reserva financeira', 'OrganizaÃ§Ã£o mensal', 'ComparaÃ§Ã£o financeira', 'Economia planejada'], tasks: [{ tipo: 'orcamento', descricao: 'Defina um orÃ§amento para uma categoria.', validacao: 'orcamento', rota: '/orcamentos' }, { tipo: 'orcamentos', descricao: 'Defina limites para duas categorias.', validacao: 'orcamentos_2', rota: '/orcamentos' }, { tipo: 'transacao', descricao: 'Registre uma receita ou despesa.', validacao: 'transacao', rota: '/gastos' }] },
  construtor: { modules: ['Metas avanÃ§adas', 'Planejamento', 'Investimentos bÃ¡sicos'], topics: ['Metas com prazo', 'Planejamento', 'Reserva', 'Investimentos', 'EvoluÃ§Ã£o financeira', 'DiversificaÃ§Ã£o'], tasks: [{ tipo: 'meta', descricao: 'Crie uma meta financeira.', validacao: 'meta', rota: '/metas' }, { tipo: 'orcamento', descricao: 'Planeje uma categoria no orÃ§amento.', validacao: 'orcamento', rota: '/orcamentos' }, { tipo: 'investimento', descricao: 'Defina investimentos e economia no orÃ§amento.', validacao: 'investimento', rota: '/orcamentos' }] },
  estrategista: { modules: ['AnÃ¡lise financeira', 'OtimizaÃ§Ã£o', 'EstratÃ©gia financeira'], topics: ['Indicadores', 'RelatÃ³rios', 'ProjeÃ§Ãµes', 'ReduÃ§Ã£o inteligente', 'Investimentos', 'EstratÃ©gia'], tasks: [{ tipo: 'transacao', descricao: 'Registre movimentaÃ§Ãµes para anÃ¡lise.', validacao: 'transacao', rota: '/gastos' }, { tipo: 'categorias', descricao: 'Registre gastos em duas categorias para anÃ¡lise.', validacao: 'categorias', rota: '/analises' }, { tipo: 'investimento', descricao: 'Defina investimentos e economia no orÃ§amento.', validacao: 'investimento', rota: '/orcamentos' }] },
  mestre: { modules: ['Auditoria financeira', 'IndependÃªncia financeira', 'EstratÃ©gia de longo prazo'], topics: ['Auditoria', 'Planejamento anual', 'DiversificaÃ§Ã£o', 'IndependÃªncia', 'Carteira financeira', 'Legado financeiro'], tasks: [{ tipo: 'orcamento', descricao: 'Revise um orÃ§amento financeiro.', validacao: 'orcamento', rota: '/orcamentos' }, { tipo: 'investimento', descricao: 'Revise o valor de investimentos e economia.', validacao: 'investimento', rota: '/orcamentos' }, { tipo: 'meta', descricao: 'Crie uma meta de longo prazo.', validacao: 'meta', rota: '/metas' }] },
};

export const TRACK_LESSONS: Lesson[] = (Object.keys(TRACKS) as ProfileType[]).flatMap((perfil) => Array.from({ length: 30 }, (_, index) => {
  const track = TRACKS[perfil]; const tier = Math.floor(index / 10); const baseTask = track.tasks[index % track.tasks.length];
  const topic = track.topics[index % track.topics.length];
  const task = { ...baseTask, descricao: `${baseTask.descricao} Nesta missÃƒÂ£o, aplique ${topic.toLowerCase()} na etapa ${index + 1} da sua trilha.` };
  return { id: `track-${perfil}-${index + 1}`, titulo: `${topic}: passo ${index + 1}`, descricao: `Aplique ${topic.toLowerCase()} ÃƒÂ  sua realidade financeira.`, duracao: `${3 + tier * 2} min`, xp: 10 + tier * 10, perfil: [perfil], desafio: task.tipo, nivel: tier * 33 + (index % 10) * 3 + 1, modulo: track.modules[tier], conteudo: `Nesta aula vocÃƒÂª aprende sobre ${topic.toLowerCase()} e transforma o conceito em uma decisÃƒÂ£o prÃƒÂ¡tica dentro do FinEdu Wallet.`, desafioPratico: task };
}));

export function getLessonById(id: string): Lesson | undefined { return [...LESSONS, ...TRACK_LESSONS].find((lesson) => lesson.id === id); }
