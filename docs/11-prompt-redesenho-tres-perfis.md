# Prompt técnico — redesenho do FinEdu Wallet para três perfis

Você é uma pessoa desenvolvedora sênior responsável por executar um redesenho estrutural do FinEdu Wallet. Antes de editar, leia `docs/10-documentacao-tecnica-atual.md` para entender o comportamento existente. Trabalhe em cima do código atual, preserve a operação offline e entregue uma experiência mais simples para jovens de 12 a 18 anos.

## Decisão de produto

O FinEdu não deve crescer como um gerenciador financeiro adulto. O produto passa a ser uma jornada de competência:

```text
onboarding → entender minha situação → registrar ou planejar → receber feedback → concluir uma missão → evoluir
```

A navegação deve ser fixa para todas as pessoas usuárias. A complexidade muda dentro das telas conforme a etapa da jornada, e não pela troca de arquitetura do menu.

## Restrições obrigatórias

- Manter PWA offline, IndexedDB local, ausência de login, backend e chamadas externas obrigatórias.
- Usar somente textos em UTF-8 e pt-BR. Corrigir arquivos com caracteres corrompidos.
- Manter os dados existentes sempre que houver equivalente no novo modelo; criar migração de estado ao carregar dados antigos.
- Não recomendar produtos de investimento nem usar perfis de risco como classificação de maturidade.
- Não usar streaks punitivos, ranking entre usuários ou XP por tempo de tela.
- Criar modais centralizados em celular; em tablet e desktop manter menu lateral e conteúdo responsivo.

## 1. Perfis: reduzir para três estágios de competência

Substitua os cinco perfis atuais por:

| Perfil | Papel | Mensagem |
| --- | --- | --- |
| Explorador | Descobrir para onde o dinheiro vai | “Estou começando a acompanhar meu dinheiro.” |
| Equilibrado | Organizar o mês e antecipar gastos | “Estou aprendendo a fazer meu dinheiro durar.” |
| Planejador | Tomar decisões com histórico e objetivos | “Uso meu histórico para planejar melhor.” |

Não utilizar Conservador, Moderado ou Arrojado: são termos associados a tolerância de risco de investimento e não devem representar maturidade financeira.

### Onboarding

- Manter cinco perguntas, uma por tela, e acrescentar uma pergunta contextual sem pontuação sobre a principal origem do dinheiro: mesada, ajuda familiar, trabalho, bicos/renda ocasional ou outro.
- Avaliar três dimensões: controle, planejamento e objetivos.
- O resultado deve mostrar perfil, explicação simples e **uma primeira missão**, não lista de recursos liberados.
- Exemplos de primeira missão:
  - Explorador: registrar três gastos reais;
  - Equilibrado: registrar um compromisso deste mês;
  - Planejador: criar um objetivo de poupança.

### Evolução

- Remover a experiência de 100 níveis por perfil e a promoção baseada apenas em XP.
- XP permanece como micro-recompensa visual.
- Evolução deve exigir competências reais persistidas, por exemplo:
  - Explorador → Equilibrado: registrar em dias diferentes, usar categorias e concluir competências básicas;
  - Equilibrado → Planejador: criar compromisso, definir plano simples, criar objetivo, fazer aporte e revisar o mês.
- Exibir no Perfil as competências concluídas e a próxima que falta.

## 2. Navegação fixa: cinco destinos

Para todos os perfis, o menu deve ter exatamente esta ordem:

1. Início (`/dashboard`)
2. Extrato (`/gastos`)
3. Planejamento (`/planejamento`)
4. Aprender (`/aprender`)
5. Perfil (`/perfil`)

### Rotas e remoções

- Criar `/planejamento` como destino central.
- Remover do menu e redirecionar rotas antigas `/previsoes`, `/orcamentos`, `/metas`, `/analises` e `/investimentos` para `/planejamento` ou para uma âncora/seção adequada dentro dessa página.
- Remover componentes, links, flags e código sem uso após a migração, sem deixar telas antigas ocultas acessíveis por URL.
- Remover a página operacional de Carteira e a gestão manual de investimentos desta fase. Não reintroduzir Contas ou Patrimônio.
- A Carteira atual deve ser migrada: valores protegidos ligados a metas viram saldo da meta; itens sem vínculo devem ser tratados como reserva/valor guardado no Planejamento ou descartados somente mediante regra de migração documentada. Nunca perder dados silenciosamente.

## 3. Início: estado atual e próxima ação

O Início deve responder sem exigir interpretação de gráficos:

1. quanto tenho disponível;
2. como está meu mês;
3. o que faço agora.

### Estrutura

- Card de resumo: disponível, entrou, saiu e ainda vou pagar.
- Card de próxima ação: uma recomendação acionável com botão.
- Card “Este mês”: até três categorias relevantes ou resumo simples; abrir o Extrato filtrado ao tocar.
- Card de missão atual: progresso, explicação e atalho para a ação necessária.
- Remover personalização/reordenação de cards desta versão.
- Não mostrar score 0–100 como elemento principal para quem ainda tem poucos dados.
- Antes de dados suficientes, usar mensagem como “Estamos conhecendo seus hábitos” com contagem de gastos e categorias.
- Com dados suficientes, usar explicação humana: “Você gastou 46% do que recebeu” ou “Lazer está acima do que você costuma gastar”.

### Conteúdo por perfil

- Explorador: saldo, entrou/saiu, próxima missão e categorias simples.
- Equilibrado: acrescentar previsto do mês e alerta de categoria.
- Planejador: acrescentar comparação com mês anterior e decisão prioritária.

## 4. Extrato: registro rápido e correção fácil

O fluxo principal deve caber em valor, categoria e salvar.

### Requisitos

- Alternador Entrada/Despesa destacado: verde para entrada e vermelho para despesa.
- Valor e categoria obrigatórios; data inicia como hoje.
- Mostrar categorias prioritárias como ícones visíveis; descrição, data diferente e opções avançadas ficam em “Mais opções”.
- Trocar CTAs genéricos por “Salvar R$ X,XX”.
- Após salvar, fechar o modal e mostrar feedback não bloqueante no Extrato ou Início:
  - valor e categoria registrados;
  - insight contextual de orçamento/histórico quando houver dados;
  - botões **Desfazer** e **Ver no extrato**.
- Implementar Desfazer por uma janela temporária: remover apenas a transação recém-criada e não desfazer outra ação posterior.
- Manter edição e exclusão de transação em modal centralizado.
- Cartão de crédito deixa de ser categoria. Se meio de pagamento for mantido, tratar como campo opcional de pagamento, sem criar módulo de fatura nesta versão.

## 5. Planejamento: substituir Previsões, Orçamento, Metas, Carteira e Análises

`/planejamento` deve possuir três cards principais e não deve parecer um conjunto de módulos independentes.

### Card 1 — Meu mês

Exibir:

```text
Recebi
Já gastei
Ainda vou pagar
Livre depois disso
```

`livre depois disso = receitas do mês - despesas realizadas - compromissos pendentes`.

Quando ainda não houver receita, explicar que o app precisa de uma entrada para comparar o planejamento.

### Card 2 — Compromissos

- Botão “Adicionar compromisso”.
- Mostrar inicialmente três tipos em botões visíveis: Uma vez, Todo mês e Parcelado.
- Uma vez: nome, valor e data.
- Todo mês: nome, valor e dia de vencimento.
- Parcelado: nome, valor total e quantidade de parcelas; calcular valor mensal, posição (`2 de 6`) e próximo vencimento.
- Semanal, quinzenal e anual ficam em “Mais opções”.
- Pagar compromisso gera despesa no Extrato, remove a ocorrência do previsto e atualiza o card Meu mês.
- Na exclusão, permitir “Somente esta ocorrência” ou “Esta e as próximas”, sem alterar o passado.

### Card 3 — Meu plano e objetivo

Substituir o orçamento detalhado por três envelopes:

| Envelope | Significado |
| --- | --- |
| Essencial | O que preciso pagar |
| Livre | O que posso escolher gastar |
| Objetivo | O que quero guardar |

- Sugerir valores com base na renda e no histórico, mas permitir edição manual.
- Explorador: mostrar apenas uma sugestão simples de quanto pode guardar, sem percentuais complexos.
- Equilibrado: mostrar os três envelopes e valores editáveis.
- Planejador: mostrar percentuais, comparação previsto × realizado e comparação com mês anterior.
- A soma dos envelopes deve ser visível; alertar, sem bloquear, quando exceder a renda.

#### Objetivo de poupança

- Integrar metas no mesmo card; não criar página separada.
- Criar objetivo com ícone, valor-alvo e quantidade de meses.
- Exibir progresso, valor guardado, aporte necessário por mês e botão Aportar.
- O aporte deve registrar movimento próprio e atualizar o valor guardado, sem entrar como saldo disponível.
- Manter várias metas somente se a interface continuar simples; uma meta principal deve receber destaque.

## 6. Aprender: poucas competências globais

Manter uma única missão ativa, mas substituir a estrutura de 30 aulas por perfil por uma trilha global de 8 a 12 competências, cuja ordem muda conforme o perfil e o estado.

Competências iniciais sugeridas:

1. acompanhar o dinheiro;
2. entender entrada e despesa;
3. usar categorias;
4. diferenciar desejo e necessidade;
5. antecipar um gasto;
6. definir um limite simples;
7. criar objetivo;
8. fazer primeiro aporte;
9. revisar o mês;
10. conhecer reserva e investimento de forma educativa.

Cada competência precisa conter um conceito curto, uma ação real verificável e feedback após conclusão. Não liberar conclusão por abrir tela ou por tempo de uso.

## 7. Perfil: desenvolvimento e preferências

Redesenhar o Perfil para mostrar:

- estágio atual e explicação;
- competências já demonstradas;
- próxima competência necessária;
- progresso da jornada;
- conquistas/histórico de aprendizagem;
- preferências e ação de recomeçar.

Retirar da superfície principal XP total, contagem total de transações, quatro desafios paralelos e níveis 1–100. XP pode permanecer em área secundária como recompensa.

Substituir os quatro desafios mensais por uma missão atual proveniente da trilha. Se houver desafios legados salvos, migrar ou removê-los sem quebrar o estado.

## 8. Modelo de dados e migração

- Atualizar tipos, store e persistência para três perfis e competências.
- Criar versão/migração explícita do estado IndexedDB para dados existentes.
- Migrar metas atuais para objetivos do Planejamento, preservando título, ícone, valor-alvo, valor atual e prazo em meses.
- Migrar previsões para compromissos do Planejamento.
- Converter orçamentos por categoria em envelopes quando possível; se a conversão não for exata, manter os valores como referência local documentada.
- Remover modelos de cartão, Carteira e investimentos que não tiverem uso após a migração.
- Garantir que reset continue limpando toda a estrutura nova.

## 9. Qualidade e validação

- Não deixar imports, rotas, flags, tipos ou textos de telas removidas.
- Atualizar toda a documentação em `docs/` para a arquitetura de três perfis e cinco destinos.
- Adicionar comentários curtos somente nas regras críticas: cálculo de livre depois disso, progressão por competências, migração de estado e desfazer transação.
- Executar `npm.cmd run typecheck`, `npm.cmd run lint` e `npm.cmd run build`.
- Validar manualmente: primeiro uso, cada perfil, registro de entrada/despesa, desfazer, edição, compromisso único/mensal/parcelado, objetivo/aporte, persistência após recarregar, reset e modo offline.

## Definição de pronto

O trabalho estará concluído quando houver somente cinco destinos de navegação, três perfis de competência, planejamento centralizado, registro rápido reversível, missão única, dados persistidos/migrados, textos corretos em pt-BR e todas as validações técnicas aprovadas.
