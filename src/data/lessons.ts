import { orderedTrail, TRAIL_LESSONS } from './trailLessons';
import { SIMPLE_LESSONS } from './simpleLessons';
import { TRAIL_LESSONS as LEGACY_TRAIL } from './legacyTrailLessons';
import type { ProfileType, JourneyPreferences, ActivityRequirement } from '@/types';

export interface Lesson {
  order?: number;
  difficulty?: number;
  requirements?: ActivityRequirement[];
  question?: { text: string; options: string[]; correct: number; explanation: string };
  id: string; titulo: string; descricao: string; duracao: string; xp: number;
  perfil: ProfileType[] | 'all'; conteudo: string; desafio: string; nivel?: number; modulo?: string;
  desafioPratico?: { tipo: string; descricao: string; validacao: string; rota: string };
}

type TaskKey = 'transacao' | 'categorias' | 'meta' | 'orcamento' | 'orcamentos_2' | 'investimento';
const tasks: Record<TaskKey, { tipo: string; descricao: string; validacao: string; rota: string }> = {
  transacao: { tipo: 'transacao', descricao: 'Registre uma entrada ou uma despesa real no app.', validacao: 'transacao', rota: '/gastos' },
  categorias: { tipo: 'categoria', descricao: 'Tenha despesas registradas em pelo menos duas categorias.', validacao: 'categorias', rota: '/gastos' },
  meta: { tipo: 'meta', descricao: 'Crie uma meta com um objetivo que faça sentido para você.', validacao: 'meta', rota: '/metas' },
  orcamento: { tipo: 'orcamento', descricao: 'Defina um limite para uma categoria do seu mês.', validacao: 'orcamento', rota: '/orcamentos' },
  orcamentos_2: { tipo: 'orcamento', descricao: 'Organize pelo menos duas categorias com limites.', validacao: 'orcamentos_2', rota: '/orcamentos' },
  investimento: { tipo: 'reserva', descricao: 'Inclua um valor para investimentos e economia no seu plano.', validacao: 'investimento', rota: '/orcamentos' },
};

type Topic = [title: string, content: string, task: TaskKey];
const explorer: Topic[] = [
  ['Para onde vai meu dinheiro?', 'Um lanche aqui, uma passagem ali. Gastos pequenos também fazem parte da sua história. Registrar o que entrou e saiu ajuda a enxergar essa história sem precisar guardar tudo na memória. Comece com uma movimentação de hoje.', 'transacao'],
  ['Entrada ou saída?', 'Mesada, presente em dinheiro e pagamento por um trabalho são entradas. Compras e pagamentos são saídas. A diferença entre o que entra e o que sai ajuda você a entender quanto ainda tem disponível.', 'transacao'],
  ['Dê um nome aos seus gastos', 'Categorias juntam gastos parecidos. Alimentação pode incluir o lanche e o almoço; transporte, a passagem. Use a categoria que melhor representa o gasto. O objetivo é reconhecer padrões, não acertar uma classificação perfeita.', 'categorias'],
  ['Preciso ou quero?', 'Uma necessidade atende algo essencial. Um desejo pode trazer diversão ou conforto. Os dois têm espaço na vida. Antes de comprar, pense no que essa escolha significa para você e se cabe no dinheiro disponível.', 'transacao'],
  ['Os pequenos valores contam', 'Um gasto frequente pode parecer pequeno sozinho. Olhe seus registros e encontre algo que se repete. Saber quanto ele representa ajuda você a decidir se quer manter esse hábito ou experimentar outra escolha.', 'categorias'],
  ['Um sonho com nome', 'Uma meta transforma “quero muito” em um objetivo que você consegue acompanhar. Escolha algo seu, dê um nome e estime o valor. Não precisa ser um sonho grande para ser importante.', 'meta'],
  ['Seu dinheiro, suas prioridades', 'Pessoas diferentes escolhem coisas diferentes. Compare duas categorias do seu extrato e pense: elas combinam com o que importa para mim? Entender suas prioridades ajuda nas próximas decisões.', 'categorias'],
  ['Uma pausa antes da compra', 'Entre sentir vontade e comprar, existe espaço para pensar. Pergunte se você já tem algo parecido, quando vai usar e como ficará seu saldo. Você continua no controle da escolha.', 'transacao'],
  ['Guardar tem um motivo', 'Guardar fica mais concreto quando existe um objetivo. Veja sua meta e pense em um próximo passo possível. O valor pode ser pequeno: acompanhar o caminho também faz parte de aprender.', 'meta'],
  ['Olhe o caminho que você fez', 'Abra seus registros e encontre uma coisa que descobriu sobre si. Pode ser uma categoria frequente ou uma compra que valeu a pena. Revisar é aprender com a própria experiência, sem se julgar.', 'categorias'],
];
const equilibrado: Topic[] = [
  ['Um plano que cabe na sua vida', 'Um orçamento é uma ideia de como você quer usar o dinheiro. Comece por uma categoria que conhece bem e escolha um limite possível. Depois compare o plano com o que realmente aconteceu.', 'orcamento'],
  ['Organize suas prioridades', 'Separe o que você precisa pagar do que pode escolher. Definir limites para categorias ajuda a visualizar essas prioridades. Seu plano pode mudar quando sua realidade mudar.', 'orcamentos_2'],
  ['Conheça o dinheiro que entra', 'Uma entrada pode ser regular ou acontecer só uma vez. Registre o valor que de fato recebeu. Assim, você consegue comparar seus planos com o dinheiro disponível, sem depender de expectativas.', 'transacao'],
  ['Deixe espaço para seus objetivos', 'Uma meta pode fazer parte do seu planejamento do mês. Escolha algo que quer conquistar e acompanhe quanto falta. Pense em passos possíveis dentro da sua realidade.', 'meta'],
  ['Limites são combinados com você', 'O limite de uma categoria é uma referência para decidir. Se os gastos se aproximarem dele, pare e revise. Talvez você queira mudar uma escolha ou ajustar um plano que ficou irrealista.', 'orcamento'],
  ['O custo dos hábitos', 'Observe duas categorias do seu extrato. Em qual há gastos frequentes? Nem todo hábito precisa mudar: a ideia é decidir quais trazem valor para você e quais podem ser repensados.', 'categorias'],
  ['Pense também nos imprevistos', 'Nem tudo acontece como o planejado. Separar espaço para guardar no seu plano ajuda a tornar esse assunto visível. Você escolhe um valor que faça sentido para sua situação.', 'investimento'],
  ['Compare o plano com a prática', 'Veja os limites que definiu e os gastos registrados. Em quais categorias o plano combinou com a realidade? Ajustar o próximo mês com base nisso é uma forma de aprender.', 'orcamentos_2'],
  ['Planejar também é escolher', 'Duas coisas podem ser importantes, mas ter prazos diferentes. Olhe sua meta e decida qual pequeno passo cabe agora. Um plano útil respeita suas prioridades e suas possibilidades.', 'meta'],
  ['Sua revisão do mês', 'Reserve um momento para olhar entradas, saídas e limites. Escolha apenas um ajuste para experimentar no próximo mês. Você não precisa mudar tudo de uma vez.', 'orcamento'],
];
const expert: Topic[] = [
  ['Transforme dados em escolhas', 'Seu histórico conta como você usa o dinheiro. Compare categorias e procure um padrão que ajude em uma decisão concreta. Dados são úteis quando respondem a uma pergunta sua.', 'categorias'],
  ['Um objetivo, vários passos', 'Dividir um objetivo em partes torna o caminho mais visível. Defina uma meta com valor e prazo e acompanhe o progresso. Revise o plano quando sua realidade mudar.', 'meta'],
  ['Planeje com o que você conhece', 'Use os registros anteriores como referência para um limite. Lembre que um mês diferente pode exigir um plano diferente. O histórico orienta, mas não prevê tudo.', 'orcamento'],
  ['Compare sem se comparar', 'Seu progresso não precisa seguir o ritmo de outra pessoa. Compare seus próprios hábitos e planos ao longo do tempo. Uma decisão mais consciente já é uma descoberta importante.', 'categorias'],
  ['Objetivos que fazem sentido', 'Revisite uma meta e pergunte se ela ainda representa algo importante. Mudar de ideia também faz parte de planejar. O plano deve ajudar sua vida, não virar uma obrigação sem sentido.', 'meta'],
  ['Espaço para o futuro', 'No seu plano, diferencie o dinheiro para usar agora do que quer guardar. Dar um lugar a cada intenção ajuda a pensar no presente e no futuro com mais clareza.', 'investimento'],
  ['Cenários são possibilidades', 'Pergunte como seu plano mudaria se entrasse menos dinheiro ou surgisse uma despesa. Ajuste os limites para explorar uma possibilidade. Um cenário é um exercício, não uma previsão.', 'orcamentos_2'],
  ['Antes de investir, entenda', 'Produtos financeiros têm regras, custos e riscos diferentes. Entender seu objetivo é parte do aprendizado. Nesta etapa, apenas organize no seu plano a intenção de guardar; não é preciso contratar nenhum produto.', 'investimento'],
  ['Consistência com flexibilidade', 'Um plano útil permite revisões. Veja o que funcionou nas categorias que acompanha e o que precisa mudar. Retomar depois de uma pausa também faz parte de construir um hábito.', 'orcamentos_2'],
  ['Sua próxima decisão consciente', 'Escolha uma descoberta do seu histórico e transforme em uma ação pequena: revisar um limite, acompanhar uma meta ou registrar algo que faltou. Aprender ganha sentido na prática.', 'meta'],
];
const tracks: Record<ProfileType, Topic[]> = { explorer, equilibrado, construtor: expert, estrategista: expert, mestre: expert };
const modules = ['Descobrir', 'Colocar em prática', 'Criar consistência'];

// Mantém os IDs e as 30 etapas existentes para preservar o progresso salvo.
export const TRACK_LESSONS: Lesson[] = (Object.keys(tracks) as ProfileType[]).flatMap((profile) => Array.from({ length: 30 }, (_, index) => {
  const tier = Math.floor(index / 10);
  const [title, content, task] = tracks[profile][index % 10];
  const reflection = tier === 1 ? '\n\nAgora, aplique a ideia à sua semana. Observe um exemplo do seu próprio histórico e pense em uma escolha que faria hoje.' : tier === 2 ? '\n\nHora de revisar: o que mudou desde a primeira vez que você pensou nisso? Use seus registros para reconhecer um hábito que quer manter.' : '';
  return { id: `track-${profile}-${index + 1}`, titulo: title, descricao: `Uma descoberta para o seu dia a dia.`, duracao: `${3 + tier} min`, xp: 10 + tier * 10, perfil: [profile], desafio: task, nivel: tier * 33 + (index % 10) * 3 + 1, modulo: modules[tier], conteudo: content + reflection, desafioPratico: tasks[task] };
}));

const legacyTopics: Topic[] = [explorer[0], explorer[3], equilibrado[6], expert[7], expert[0], expert[1], equilibrado[4], expert[4]];
export const LESSONS: Lesson[] = legacyTopics.map(([title, content, task], index) => ({ id: `l${index + 1}`, titulo: title, descricao: title, duracao: '3 min', xp: 15, perfil: 'all', conteudo: content, desafio: task, desafioPratico: tasks[task] }));
export function getLessonsForProfile(profile: ProfileType, focus?: JourneyPreferences['focus']): Lesson[] { return orderedTrail(profile, focus); }
export function getLessonById(id: string): Lesson | undefined { return [...TRAIL_LESSONS, ...LEGACY_TRAIL, ...SIMPLE_LESSONS, ...LESSONS, ...TRACK_LESSONS].find((lesson) => lesson.id === id); }
