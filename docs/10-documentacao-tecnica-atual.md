# Documentação técnica do FinEdu Wallet — estado atual

> **Referência:** auditoria do código em `src/`, realizada em setembro de 2026. Este documento descreve o comportamento implementado e ativo no repositório. Quando uma tela pode ser acessada por rota, mas não aparece no menu de um perfil, essa diferença está registrada explicitamente.

## 1. Visão geral do produto

O FinEdu Wallet é uma aplicação web progressiva (PWA) de organização financeira e educação financeira. O foco atual combina registro de receitas e despesas, previsões de compromissos, orçamento por categoria, metas, Carteira, análises, desafios e uma trilha de aprendizado.

O produto funciona sem autenticação e sem backend. Os dados são mantidos no dispositivo da pessoa usuária. A interface é responsiva: em celular usa barra inferior; a partir de `768px`, a navegação se torna lateral e o conteúdo ocupa a área de dashboard.

### Stack

| Camada | Tecnologia | Uso atual |
| --- | --- | --- |
| Interface | React 18 + TypeScript | Páginas, componentes e estado de interface |
| Navegação | React Router com `HashRouter` | Rotas compatíveis com GitHub Pages |
| Estado | Zustand | Estado de domínio e ações de negócio |
| Persistência | `idb` / IndexedDB | Um único registro de estado local (`finedu-wallet/appstate/main`) |
| Estilo | Tailwind CSS | Layout, cores, responsividade e componentes |
| Animação | Framer Motion | Entrada/saída de cards e modais |
| Gráficos | Recharts | Análises, categorias e comparações |
| PWA | Vite PWA / Workbox | Manifesto, service worker, precache e atualização automática |
| Ícones | Lucide React | Navegação, categorias e ações |

### PWA e funcionamento offline

- O `vite-plugin-pwa` gera o service worker em modo `generateSW`.
- HTML, JavaScript, CSS, SVG, PNG, fontes e JSON entram no precache de produção.
- O `start_url`, o `scope` e os caminhos de assets são relativos (`./`), para suportar publicação em subdiretório no GitHub Pages.
- O app solicita `navigator.storage.persist()` quando o navegador oferece suporte.
- A aplicação não precisa de rede para ler ou gravar os dados após a instalação/cache inicial.
- Não há login, API remota, sincronização entre dispositivos, analytics implementado ou recuperação de dados em outro aparelho.

### Dados persistidos

O estado salvo contém:

- onboarding e perfil inicial/atual;
- receitas e despesas;
- metas e Carteira;
- desafios atuais e histórico de desafios;
- progresso de aulas e XP;
- orçamentos por categoria;
- despesas previstas;
- cartões e despesas de cartão ainda presentes no modelo de domínio;
- ordem e visibilidade de cards da tela inicial.

O botão **Recomeçar** remove todo o registro do IndexedDB. Não existe lixeira, backup ou confirmação externa de recuperação.

## 2. Rotas e proteção de acesso

As rotas abaixo existem no `App.tsx`. Todas, exceto a landing e o onboarding, exigem `onboarding.completed === true`.

| Rota | Página | Situação |
| --- | --- | --- |
| `#/` | Landing | Pública; redireciona ao dashboard se onboarding já estiver concluído |
| `#/onboarding` | Onboarding | Pública |
| `#/dashboard` | Início | Protegida |
| `#/gastos` | Extrato | Protegida |
| `#/previsoes` | Previsto/Planejamento | Protegida |
| `#/orcamentos` | Orçamento | Protegida |
| `#/analises` | Análises | Protegida |
| `#/metas` | Metas | Protegida |
| `#/investimentos` | Carteira | Protegida |
| `#/aprender` | Aprender | Protegida |
| `#/perfil` | Perfil | Protegida |

> **Importante:** a proteção atual verifica somente a conclusão do onboarding. Ela não bloqueia diretamente uma rota conforme o perfil. A disponibilidade por perfil é aplicada principalmente pelo menu e por cards do dashboard. Assim, uma rota pode não aparecer no menu, mas continua tecnicamente navegável por URL ou por um link interno.

As antigas rotas de **Contas** e **Patrimônio** foram removidas do roteador. Não há página `Accounts` ou `Patrimony` ativa.

## 3. Jornada de entrada e classificação

### Landing

A landing apresenta a proposta do produto e o botão **Iniciar**. Também comunica que não há cadastro e que os dados permanecem no dispositivo.

### Onboarding

O onboarding possui cinco perguntas de múltipla escolha, cada uma com 0, 1 ou 2 pontos. Elas avaliam:

1. percepção sobre para onde o dinheiro vai;
2. decisão diante de compra não planejada;
3. comportamento ao receber dinheiro;
4. hábito de guardar para objetivos;
5. relação pessoal com dinheiro.

A pontuação define o perfil inicial:

| Pontuação | Perfil inicial |
| --- | --- |
| 0 a 3 | Explorador Financeiro |
| 4 a 6 | Equilibrado Financeiro |
| 7 a 8 | Construtor Financeiro |
| 9 a 10 | Estrategista Financeiro |

O onboarding mostra o perfil, seu objetivo e os itens de menu daquele perfil. Ao concluir, cria quatro desafios mensais e persiste o estado.

### Evolução posterior

O perfil atual é recalculado com base no XP acumulado e no perfil inicial. Cada perfil tem 100 níveis de 100 XP; portanto, são necessários 10.000 XP para avançar um perfil a partir do perfil inicial. O perfil Mestre é o limite máximo.

No código atual, a promoção depende do XP acumulado. As missões e desafios possuem validações práticas, mas essas validações não são um requisito adicional formal para a promoção do perfil.

## 4. Perfis, menus e capacidades

### Navegação mostrada por perfil

| Perfil | Menu visível | Objetivo apresentado |
| --- | --- | --- |
| Explorador | Início, Extrato, Aprender, Perfil | Criar consciência financeira |
| Equilibrado | Início, Extrato, Planejamento, Aprender, Perfil | Organizar e equilibrar finanças |
| Construtor | Início, Extrato, Planejamento, Orçamento, Análise, Perfil | Construir patrimônio e planejar o futuro |
| Estrategista | Início, Extrato, Planejamento, Orçamento, Análise, Carteira, Perfil | Otimizar a estratégia financeira |
| Mestre | Início, Extrato, Planejamento, Orçamento, Análise, Carteira, Perfil | Manter excelência e multiplicar resultados |

### Flags de recurso

`src/data/profiles.ts` contém várias flags de recurso, como `orcamento`, `metas`, `analises`, `investimentos`, `scoreSaude` e `comparacaoMensal`.

O uso efetivo atual é parcial:

- O menu usa `config.menu` e é a principal forma de liberar telas visualmente.
- O dashboard usa algumas flags, como `comparacaoMensal` e `metas`, para decidir se mostra cards.
- As rotas protegidas não consultam essas flags.
- A página de Metas não aparece em nenhum menu atual, embora `#/metas` esteja ativa e seja aberta por cards, desafios e missões quando aplicável.
- Algumas flags antigas ainda usam nomes como `contas` e `patrimonio`, apesar de essas páginas terem sido removidas. Elas não restauram essas telas por si só.

## 5. Início (Dashboard)

O dashboard usa dados de transações, previsões, orçamento, metas, Carteira, XP e aulas para montar cards configuráveis. A ordem e a visibilidade dos cards são persistidas em `cardOrder` e `disabledCards`.

### Resumo financeiro

- **Saldo Total:** se houver qualquer item na Carteira, mostra somente a soma de itens marcados como `considerarDisponivel`; se não houver Carteira, usa o saldo de transações (`receitas - despesas`).
- **Entradas x Saídas:** mostra receitas e despesas do mês selecionado e permite navegar para o Extrato com filtro e mês.
- **Previsto:** mostra o total de compromissos ainda pendentes no mês e abre a tela de Previsões.
- Para o perfil Explorador, o terceiro bloco do resumo mensal é substituído por informação de aprendizado, conforme a configuração do dashboard.

### Cards ativos

Os cards-base são: saldo, entradas/saídas, gastos por categoria, saúde financeira e metas. Dependendo do perfil e do estado também podem existir comparação mensal e outros cards previstos pela configuração.

- **Gastos por categoria:** gráfico de pizza/donut. Um toque em categoria abre o Extrato com aquele filtro.
- **Saúde financeira:** calcula score de 0 a 100 a partir de entradas, despesas e aderência aos orçamentos. A interface também apresenta uma mensagem de estado e sugestões.
- **Metas:** exibe até três metas e abre `#/metas` ao tocar.
- **Sugestões:** ficam abaixo dos cards e são calculadas por comportamento do mês, aumento de gasto frente ao mês anterior, estouro de orçamento, saldo positivo ou ausência de movimentações.
- **FAB:** abre o modal de nova transação.

### Personalização de cards

O dashboard permite ocultar/reativar cards e reorganizar a ordem. Essa personalização é local e é salva junto com o restante do estado.

## 6. Registro rápido e Extrato

### Nova transação

O modal `QuickAddModal` abre centralizado. O tipo inicial é:

- **Entrada**, se ainda não existir nenhuma receita;
- **Despesa**, se houver ao menos uma receita registrada.

O controle segmentado permite alternar entre Entrada e Despesa. A categoria é reiniciada ao trocar o tipo, evitando gravar uma categoria incompatível.

O fluxo disponível inclui:

- valor em reais;
- categoria obrigatória;
- categorias recentes e categorias mais usadas;
- descrição opcional;
- descrições recentemente utilizadas;
- escolha de tipo e tela de confirmação ainda existentes no componente;
- botão principal direto com texto dinâmico, como **Salvar R$ 18,00**, na etapa de valor.

Ao salvar, a transação recebe identificador local, data/hora atual e 5 XP. O modal fecha; não há, no estado atual, um mecanismo de desfazer após o salvamento.

### Extrato

O Extrato oferece:

- seletor mensal anterior/próximo;
- totais de receitas e despesas para o mês selecionado;
- busca por descrição ou nome de categoria;
- filtro de todos, receitas ou despesas;
- filtro de categoria recebido por navegação do dashboard;
- lista de movimentos com ícone/cor da categoria, data, valor e sinal;
- exclusão direta;
- edição por modal centralizado ao tocar no movimento.

No editor podem ser alterados tipo, valor, categoria, data e descrição. A exclusão também está disponível no contexto de edição.

### Categorias

As categorias atuais são: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Cartão de crédito, Investimentos/Economia, Salário e Outros. Cada categoria possui tipo permitido, ícone e cor.

## 7. Previsto e compromissos

A tela de Previsões trabalha com `PlannedExpense` e com ocorrências calculadas por mês. Um compromisso tem título, categoria, valor, tipo, data inicial, vencimento, recorrência, pagamentos e status.

### Tipos e recorrências

- **Única:** ocorre somente no mês da data de vencimento.
- **Fixa mensal:** ocorre todo mês a partir da data inicial.
- **Semanal:** repete a cada 7 dias; podem existir várias ocorrências dentro de um mês.
- **Quinzenal:** repete a cada 15 dias.
- **Anual:** ocorre no mês correspondente ao vencimento inicial.
- **Parcelada:** gera uma ocorrência mensal por parcela, respeitando `totalParcelas` e exibindo a parcela corrente.

O cálculo de ocorrências semanais e quinzenais percorre datas reais dentro do mês. Para parcelas, a posição é determinada pela diferença em meses entre vencimento inicial e mês consultado.

### Pagamento e efeitos

Ao pagar uma ocorrência:

1. uma despesa é criada no Extrato com a origem adequada (`prevista`, `fixa`, `recorrente` ou `divida`);
2. a ocorrência entra em `pagamentos`;
3. ela deixa de somar no previsto pendente;
4. soma em despesas realizadas do mês e passa a afetar orçamento, análises e dashboard;
5. concede 5 XP.

Para uma dívida parcelada, o sistema incrementa `parcelaAtual` e finaliza o compromisso quando passa do total de parcelas.

### Exclusão

O modelo suporta exclusão do registro de previsão. A tela também possui fluxo de decisão para ocorrências; o comportamento de “somente esta” usa a lista de ocorrências ignoradas/pagas e o de “esta e próximas” usa encerramento da previsão a partir de uma data. Ocorrências anteriores não são reescritas.

### Cartão de crédito no domínio

O store ainda possui modelos e ações para cartões, despesas de cartão e pagamento de fatura. O cálculo mensal pode incluir itens de cartão vencidos no mês. Não há uma página de cartão no menu atual; essa estrutura é utilizada como apoio ao cálculo de previsão e à criação de despesa de fatura quando acionada.

## 8. Orçamento

O orçamento mensal usa as receitas registradas no mês atual como referência. Os limites ficam em `budgets`, um por categoria.

### Estratégias e grupos

As categorias são organizadas em três grupos:

| Grupo | Categorias |
| --- | --- |
| Essencial | Moradia, Alimentação, Transporte, Saúde e Educação |
| Objetivos e reserva | Investimentos/Economia |
| Qualidade de vida | Lazer, Cartão de crédito e Outros |

A estratégia sugerida depende do perfil e considera gasto essencial observado. As regras-base atuais são:

| Perfil | Essencial | Objetivos/reserva | Qualidade de vida |
| --- | ---: | ---: | ---: |
| Explorador | 80% | 10% | 10% |
| Equilibrado | 70% | 20% | 10% |
| Construtor | 60% | 20% | 20% |
| Estrategista | 50% | 30% | 20% |
| Mestre | 40% | 40% | 20% |

Se o gasto essencial atual já excede a regra-base, o motor escolhe uma estratégia viável com percentual essencial maior, quando houver.

### Definição e edição

- O card **Definir orçamento** é expansível.
- A pessoa escolhe uma categoria ainda não orçada por uma grade de ícones.
- A lâmpada abre o modal centralizado da estratégia recomendada.
- Aplicar a estratégia cria/atualiza limites para todas as categorias dos três grupos, dividindo igualmente o valor de cada grupo entre as categorias elegíveis.
- O valor recomendado é apenas referência. A edição manual é permitida.
- Cada limite manual não pode ser maior que duas vezes a renda do mês.
- Clicar no valor de uma categoria abre modal de edição.
- A barra de controle usa trilho cinza e marcador na cor da categoria.
- Em categorias de despesa, outra barra mostra percentual realizado na cor da categoria.
- Investimentos/Economia é apresentado como valor programado para investir/economizar, sem consumo por despesa comum.

### Redistribuição e alerta

Ao excluir uma categoria do orçamento, o limite sugerido do grupo é redistribuído igualmente entre as categorias restantes daquele grupo. Se o plano total ultrapassar a renda registrada, o acompanhamento recebe borda, barra e mensagem vermelhas. O sistema preserva o plano para que a pessoa possa ajustá-lo; não o bloqueia apenas por exceder a renda.

## 9. Metas

Metas representam objetivos concretos e estão vinculadas à Carteira.

### Criação

- **Nova meta** aparece acima da lista existente.
- A criação abre modal centralizado.
- Não há campo de categoria nem data específica.
- A pessoa escolhe um ícone/objetivo, valor-alvo e quantidade de meses.
- Objetivos disponíveis: Casa, Veículo, Viagem, Estudos e Realização.
- Cada objetivo tem cor própria.

Ao criar uma meta, o store também cria automaticamente um item de Carteira protegido. O item recebe `metaId`, `investimentoId`, nome da meta, ícone selecionado, tipo `reserva`, valor inicial zero e `considerarDisponivel: false`.

### Acompanhamento e aportes

Cada card mostra ícone, valor atual, valor-alvo, percentual, prazo em meses e aporte mensal calculado. O botão **Fazer aporte** abre modal centralizado; o valor adicionado atualiza simultaneamente a meta e seu item vinculado na Carteira. O aporte é limitado ao valor-alvo da meta.

Metas novas são ordenadas por menor prazo. Setas permitem mover uma meta para cima ou para baixo, e a ordem resultante é persistida.

### Exclusão e vínculo

- Excluir uma meta remove o item de Carteira que possui o mesmo `metaId`.
- Excluir um item de Carteira vinculado também remove a meta correspondente.
- Alterar o valor de um item vinculado na Carteira atualiza `valorAtual` da meta.

## 10. Carteira

A Carteira está acessível no menu de Estrategista e Mestre, e pela rota protegida para outros perfis.

### Totais

- **Patrimônio financeiro:** soma todos os itens da Carteira.
- **Saldo disponível para usar:** soma somente itens marcados como `considerarDisponivel`.
- Valores de metas e reservas protegidas não entram no saldo disponível por padrão.

### Grupos exibidos

Os itens são ordenados e separados visualmente em:

1. Saldo;
2. Metas;
3. Reservas;
4. Investimentos.

Identidade visual:

- Saldo disponível: carteira verde;
- Meta: mesmo ícone da meta; na listagem atual o fundo visual é roxo;
- Reserva: escudo azul;
- Investimento: instituição financeira âmbar.

### Operações

- Adicionar item com nome, valor e tipo: saldo disponível, reserva de emergência ou investimento.
- Marcar/desmarcar se o item deve compor saldo disponível.
- Excluir item.
- Transferir valor entre dois itens, desde que origem tenha saldo suficiente e origem/destino sejam diferentes.
- Se o item origem ou destino estiver vinculado a meta, a transferência atualiza o progresso da meta vinculada.

Nos perfis Estrategista e Mestre, a Carteira ainda mostra o card **Aprender sobre investimentos**, com progresso de aulas do perfil e atalho para a trilha.

## 11. Análises

Análises possui seletor de mês e cards expansíveis. Cada card abre/fecha de forma independente.

| Card | Fonte e comportamento |
| --- | --- |
| Indicadores | Receitas, despesas e score no mês selecionado |
| Evolução do saldo | Linha baseada em receitas menos despesas dos últimos seis meses |
| Gastos por categoria | Pizza e lista de valores do mês selecionado |
| Entradas x Saídas | Barras dos últimos seis meses |
| Previsto x Realizado | Total previsto, despesas realizadas e pendência calculada para o mês |

Os dados de comparação mensal são calculados a partir das transações. O saldo de evolução do gráfico representa o resultado de cada mês, não um saldo acumulado histórico.

## 12. Aprender, XP e desafios

### Trilha ativa

A página Aprender foi ajustada para exibir uma única aula/missão ativa: a primeira aula ainda não concluída para o perfil atual.

Ela mostra:

- posição da etapa na trilha;
- título, duração e XP;
- conteúdo da aula;
- missão prática;
- botão para navegar à tela necessária;
- botão de conclusão habilitado apenas quando a regra prática é satisfeita.

Depois de concluir, a próxima aula passa a ser a missão ativa. Quando não há aulas pendentes, a tela informa que a trilha do perfil foi concluída.

### Regras de validação

As aulas e desafios consultam dados reais do store. Exemplos de validação: registrar transação, registrar despesa, usar duas categorias, criar meta, definir orçamento e definir Investimentos/Economia no orçamento.

### XP

| Evento | XP |
| --- | ---: |
| Registrar transação manual | +5 |
| Pagar previsão ou fatura | +5 |
| Criar meta | +30 |
| Concluir aula | XP configurado na aula, com fallback de +15 |
| Concluir desafio | 20, 50, 90 ou 150, conforme faixa de nível |

### Desafios mensais

O sistema gera quatro desafios para o perfil/mês atual. A seleção usa biblioteca por perfil e faixa de nível, um hash determinístico por mês e histórico para evitar repetir o mesmo template durante seis meses para o mesmo perfil.

O Perfil exibe desafios, progresso atual/meta, XP e o botão **Concluir**, que só é habilitado se a validação correspondente for verdadeira.

## 13. Perfil

A tela Perfil reúne:

- XP total;
- total de desafios concluídos;
- quantidade de metas;
- quantidade total de transações;
- quatro desafios do mês;
- explicação de como ganhar XP e subir de nível;
- ação de recomeçar o aplicativo.

O reset final abre um modal próprio e, ao confirmar, limpa o estado em memória e IndexedDB, retornando para a landing.

## 14. Regras de cálculo relevantes

### Saldo de transações

`saldo = soma(receitas) - soma(despesas)`.

### Score de saúde financeira

Parte de 50 pontos. Ajusta o score conforme taxa de poupança do mês e percentual de categorias dentro de seus orçamentos. O resultado é limitado entre 0 e 100.

### Sugestões

O motor cria sugestões quando:

- gasto de categoria aumenta mais de 15% contra o mês anterior;
- gasto ultrapassa o limite de uma categoria;
- receitas menos despesas excedem 20% da renda;
- ainda não existe nenhuma transação;
- não há outra sugestão mais específica.

### Previsão mensal

Soma ocorrências pendentes de previsões fixas, dívidas/parcelas, itens planejados e despesas de cartão vencidas no mês. Ocorrências já pagas, ignoradas ou encerradas não entram no total pendente.

## 15. Limitações e pontos de manutenção

Estes itens descrevem o estado atual e devem ser considerados antes de evoluções futuras:

- Rotas não aplicam autorização por perfil; o controle de visibilidade está principalmente no menu e dashboard.
- Algumas flags de perfil com nomes de Contas/Patrimônio permanecem no modelo, embora essas páginas não existam.
- A tela de Metas está ativa por rota e por links internos, mas não aparece no menu principal atual.
- O registro rápido salva diretamente, mas não oferece desfazer após fechar o modal.
- O componente de registro rápido ainda conserva etapas internas de categoria/tipo/confirmação que coexistem com o salvamento direto na etapa de valor.
- O cartão de crédito continua no modelo e no cálculo de previsão, mas não possui uma seção de interface principal no menu.
- A aplicação possui arquivos antigos com textos que merecem revisão de codificação. O build declara `pt-BR`, mas a manutenção deve garantir leitura/gravação UTF-8 sem re-salvamento em codificação legada.
- Dependências de Supabase existem no `package.json`, mas o fluxo auditado não usa backend Supabase para operação do produto.

## 16. Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Inicialização, roteamento e proteção por onboarding |
| `src/store/useStore.ts` | Estado, persistência e ações de negócio |
| `src/lib/db.ts` | IndexedDB e solicitação de armazenamento persistente |
| `src/data/profiles.ts` | Perfis, menus e evolução por XP |
| `src/components/ui/Layout.tsx` | Cabeçalho responsivo e navegação estrutural |
| `src/components/ui/BottomNav.tsx` | Menu inferior/lateral baseado no perfil |
| `src/components/ui/QuickAddModal.tsx` | Registro rápido de transações |
| `src/pages/Dashboard.tsx` | Início, resumo, cards e sugestões |
| `src/pages/Transactions.tsx` | Extrato, filtros e edição |
| `src/pages/Forecasts.tsx` | Cadastro e pagamento de compromissos |
| `src/lib/forecast.ts` | Ocorrências e total previsto mensal |
| `src/pages/Budgets.tsx` | Estratégias, limites e acompanhamento de orçamento |
| `src/lib/budgetStrategy.ts` | Grupos e recomendação percentual por perfil |
| `src/pages/Goals.tsx` | Metas, aporte e ordenação |
| `src/pages/Investments.tsx` | Carteira, itens e transferências |
| `src/pages/Analytics.tsx` | Indicadores e gráficos expansíveis |
| `src/pages/Learn.tsx` | Missão ativa da trilha |
| `src/lib/progress.ts` | Validação de aulas e desafios |
| `src/pages/Profile.tsx` | Perfil, desafios, XP e reset |

