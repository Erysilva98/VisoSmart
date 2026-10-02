# Auditoria heurística do Nexo — 30/09/2026

> Este é o diagnóstico inicial. As correções aplicadas depois da auditoria estão registradas no veredicto; os achados acima permanecem como evidência da linha de base.

## A. Sumário executivo

**Veredicto preliminar: READY WITH FIXES.** A inspeção do código confirma fluxos de registro, metas, aprendizagem, limites, exportação e uso local. Os maiores riscos antes de um teste com jovens são a ausência de confirmação/recuperação imediata após salvar um registro, falha de persistência sem aviso visível e a exigência de dois toques no calendário sem alternativa tátil explícita. A interface não foi testada com participantes; este relatório não atribui SUS, taxa de sucesso ou conformidade WCAG definitiva.

**Inputs recebidos:** texto da auditoria, histórico de requisitos, capturas das telas, rotas, componentes, estilos, estado local e configuração PWA no repositório. **Ausentes:** artigo de pesquisa integral citado no anexo, protótipo Figma/Canva, analítica de uso, resultados de testes com jovens, matriz formal de critérios de aceitação e inspeção do produto em navegador/leitor de tela. A pesquisa resumida no anexo orienta hipóteses; seus números não comprovam eficácia do Nexo.

Achados principais, ordenados por prioridade:

| ID | Achado observado | H | S | Prioridade | Confiança |
|---|---|---:|---:|---|---|
| NEXO-H01-001 | O registro rápido fecha após salvar sem confirmação visível e sem desfazer imediato. | 1, 3 | 3 | P1 | alta |
| NEXO-H01-002 | Falha ao gravar no IndexedDB é registrada apenas no console; a tela não avisa que os dados estão pendentes. | 1, 9 | 4 | P0 | alta |
| NEXO-H06-003 | Na Home, registrar pelo calendário exige dois toques rápidos, mas a alternativa de um toque é mostrada em texto de 10 px. | 6, 7 | 2 | P2 | alta |
| NEXO-H08-004 | Home mantém resumo, atalhos, calendário e gráfico no fluxo principal; em telas baixas o gráfico fica abaixo da primeira viewport. | 8 | 2 | P2 | média |
| NEXO-H04-005 | “Entrada”, “Receita”, “Entrou” e “registro” coexistem para a mesma família de eventos. | 4 | 2 | P2 | alta |
| NEXO-H03-006 | Excluir meta confirma e devolve a reserva ao saldo, mas a operação não oferece desfazer. | 3 | 2 | P2 | alta |
| NEXO-H10-007 | Limites explicava um alerta no Extrato já removido; texto corrigido nesta auditoria. | 10 | 2→0 | resolvido | alta |
| NEXO-WCAG-008 | Textos de 10–11 px e alguns controles de 32–40 px pedem medição de contraste e alvo em aparelhos reais. | A11y | 2 | P2 | média |

Escala S0–S4: cosmético S1, fricção S2, erro/abandono sério S3, perda ou informação enganosa S4. É uma classificação de risco, não incidência medida. A [NN/g define as dez heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/) como princípios gerais e recomenda julgar severidade por frequência, impacto e persistência na [escala de severidade](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/).

## B. Estado geral

**Funciona no código:** registro com categoria/valor, validação de valor positivo e data, edição no Extrato, desfazer exclusão de transação, metas com aporte/saque separado de receitas e despesas, cinco perguntas de onboarding, missões, PDF, IndexedDB e service worker gerado.

**Não funciona suficientemente:** confirmação recuperável do registro salvo, aviso de erro na persistência, descoberta da ação do calendário. **Risco maior:** o estado React muda antes da gravação assíncrona; uma falha de armazenamento pode dar impressão de sucesso. **Limitação:** inspeção estática e capturas fornecidas; comportamento visual, offline real, contraste efetivo e compreensão por idade exigem teste.

## C. Auditoria das dez heurísticas

| H | Heurística | Estado | Evidência no Nexo | S máx. | Recomendação |
|---|---|---|---|---:|---|
| H1 | Visibilidade do estado | PARTIAL | Progresso, filtros e mês aparecem; salvar registro fecha modal sem status; falha IndexedDB só vai ao console. | 4 | Estado “salvando/salvo/falhou” e recuperação. |
| H2 | Mundo real | PARTIAL | Categorias jovens existem, mas “receita” e “entrada” variam; “saldo do mês” pode confundir com disponível. | 2 | Vocabulário único e explicação curta do saldo. |
| H3 | Controle e liberdade | PARTIAL | Extrato oferece desfazer exclusão; registro salvo e exclusão de meta não oferecem reversão imediata. | 3 | Snackbar discreto com “Desfazer”, sem pop-up. |
| H4 | Consistência | PARTIAL | Cabeçalho e navegação foram unificados; nomes de movimentação variam. | 2 | Glossário e labels estáveis. |
| H5 | Prevenção de erros | PASS/PARTIAL | Valores e datas são validados; apagar todos os dados pede confirmação; ainda não há teste de duplicidade por toque rápido. | 2 | Testar duplo envio e casos limite. |
| H6 | Reconhecimento | PARTIAL | Categorias têm ícone e nome; expandir histórico da trilha usa só ícone, com nome acessível; duplo toque depende de instrução. | 2 | Tornar ações visíveis no contexto. |
| H7 | Eficiência | PARTIAL | Valores rápidos e recentes aceleram registro; fluxo padrão ainda requer escolha, valor e salvar. | 2 | Medir tempo e decisões, não só toques. |
| H8 | Minimalismo | PARTIAL | Cards compactos; Home mostra quatro blocos de informação concorrentes. | 2 | Validar prioridade da primeira viewport com jovens. |
| H9 | Recuperação de erros | PARTIAL | Campo de valor informa erro; PDF mostra erro; falha de IndexedDB não alcança usuário. | 4 | Preservar entrada e oferecer retry. |
| H10 | Ajuda | PARTIAL | Limites tem ajuda contextual e trilha; explicação estava desatualizada (corrigida). | 2 | Auditar textos após mudanças de fluxo. |

“PASS/PARTIAL” indica que há medidas preventivas, mas testes de borda seguem pendentes. Nenhuma heurística foi declarada integralmente aprovada por captura isolada.

## D. Auditoria tela por tela

| Tela / rota | Objetivo e ação primária | Problema e H | Correção / critério de aceitação |
|---|---|---|---|
| Onboarding `/onboarding` | Definir perfil, categorias, saldo inicial | Cinco etapas exigem escolhas antes do uso (H7); desconhecemos abandono. | Testar conclusão por faixa etária; progresso e voltar devem preservar escolhas. |
| Início `/dashboard` | Entender saldo e iniciar registro | Calendário completo e gráfico concorrem pela primeira viewport (H8). | Saldo, registro e navegação acessíveis sem busca; testar alturas 667/844 px. |
| Registro rápido (modal) | Salvar entrada/despesa | Sem status/undo visível após salvar (H1/H3); persistência pode falhar sem aviso (H9). | Após salvar, confirmação não modal com valor/categoria e “Desfazer”; erro preserva campos. |
| Extrato `/gastos` | Conferir, filtrar e editar | Filtro tem soma, mas labels “receitas/entradas” variam (H4). | Uma linguagem por tipo; totais do mês não mudam ao filtrar, total filtrado permanece claro. |
| Aprender `/aprender` | Cumprir etapa e atividade | Atividade pode exigir sair do card e voltar; histórico fica em ícone (H6/H7). | Testar se jovem retoma a mesma etapa sem se perder; ícone com nome acessível e foco. |
| Metas `/metas` | Criar sonho, guardar/liberar | Excluir não oferece undo; forma visual pede teste de entendimento (H3/H2). | Exclusão confirmada e reversível por curto período ou restauração fácil. |
| Limites `/orcamentos` | Definir teto por categoria | Ajuda citava alerta inexistente no Extrato (H10), corrigido. | Ajuda aponta para indicador realmente presente em Limites. |
| Perfil `/perfil` | Ver evolução, categorias e dados | PDF/exportação depende de função assíncrona; erro informa retry, mas sem diagnóstico (H9). | Exportação repetível, dados completos e progresso/erro anunciado. |

## E. Auditoria dos fluxos centrais

Contagem estimada a partir da interface; digitação não é “um toque”. Um teste com pessoas deve medir toques físicos, decisões e tempo reais.

| Fluxo | Toques/decisões a partir da tela | Telas/modais | Campos obrigatórios | Feedback, reversão e fricção |
|---|---|---|---|---|
| Ver situação atual | 0/0 | Home | 0 | Saldo, entrou e gastos visíveis; interpretação do saldo requer teste. |
| Registrar despesa | + → categoria → valor → salvar: 3 botões + digitação; 3 decisões | 1 modal, 2 estágios | valor; categoria escolhida | Modal fecha; editar exige Extrato. |
| Registrar entrada | Igual, mais troca “Despesa” → “Entrada”: 4 botões | 1 modal | valor; categoria | Tipo inicial favorece despesa; testar frequência real. |
| Entender impacto do registro | Navegar ao Extrato/Home: +1 ou +2 | 1 tela | 0 | Totais atualizam; impacto por categoria pode ficar fora da primeira viewport. |
| Consultar movimentação recente | Extrato no menu: 1 | 1 tela | 0 | Lista e filtros; edição/desfazer exclusão disponíveis. |
| Continuar missão | Aprender: 1; atividade: variável; resposta e concluir: +2 | 1+ telas | resposta; atividade | XP e próxima etapa aparecem; retorno da atividade merece teste. |
| Criar e acompanhar meta | Metas → ícone → valor → prazo → criar: 4+ botões | 1 modal | valor, prazo, objetivo | Progresso visível; ação não precisa ser reduzida se segurança piorar. |

## F. Regra das três decisões

| Fluxo | Cumpre meta? | Redução segura? |
|---|---|---|
| Consultar saldo | Sim, imediato. | Não necessária. |
| Registrar despesa | Próximo da meta: escolher categoria, informar valor, salvar. | Sim, recente/valor rápido quando apropriado. |
| Registrar entrada | Parcial: mudar tipo acrescenta decisão. | Talvez lembrar último tipo, após teste de erro. |
| Continuar missão | Depende da atividade. | Não eliminar explicação ou checagem da resposta. |
| Criar meta | Não, mas decisões de objetivo/valor/prazo são distintas. | Não forçar três cliques se gerar meta errada. |
| Apagar todos os dados | Não avaliar por rapidez. | Não; confirmação protege dados. |

## G. Primeira viewport mobile

| Tela | Acima da dobra observado/inferido | Abaixo da dobra provável | Prioridade |
|---|---|---|---|
| Home | Cabeçalho, mês, saldo, atalhos, calendário | Gráfico em alturas menores | Mostrar saldo e +; não encolher alvo só para eliminar scroll. |
| Extrato | Mês, totais, filtros, primeiros registros | Registros restantes | Preservar soma filtrada e limpar filtros visíveis. |
| Aprender | Progresso, conteúdo, tarefa, perguntas | Respostas em etapas longas | Manter “Concluir etapa” perto das respostas e rolável quando necessário. |
| Metas | Ícones sugeridos, abas, primeiras metas | Metas seguintes | Objetivo e ação Guardar/Liberar distinguíveis. |
| Perfil | Progresso, missões, categorias/limites | Exportação e apagar dados | Ações destrutivas podem ficar abaixo. |

Posição exata depende de viewport, fonte, zoom e dados cadastrados: **NEEDS_USER_TEST**. Não foi medida por automação visual nesta auditoria.

## H. Design System Checklist

| Item | Estado | Evidência e próxima verificação |
|---|---|---|
| Cores | PARTIAL | Verde para entrada, vermelho para gasto; medir contraste em todos os estados. |
| Tipografia | PARTIAL | Hierarquia presente; 10–11 px frequentes pedem revisão de legibilidade a 200% de zoom. |
| Espaçamento/grid/breakpoints | PARTIAL | Home mobile compacta e desktop espaçado; conferir 320/390/768/1024 px. |
| Raios/sombras | PASS | Cards e modais usam padrões recorrentes; preferência estética não é prova de usabilidade. |
| Ícones | PARTIAL | Navegação tem labels; história da trilha depende de nome acessível. |
| Botões/FAB | PARTIAL | Botão + e navegação consistentes; testar sobreposição por teclado e zoom. |
| Inputs/seletores | PARTIAL | Campo de valor tem erro, categorias têm nome; revisar foco e retorno. |
| Dialog/BottomNavigation | PARTIAL | Modal de registro tem Escape e foco contido; Dialog genérico precisa teste de leitor. |
| Card/progresso/estado vazio | PARTIAL | Estados vazios visíveis; algumas barras dependem de texto adjacente. |
| Toast/Snackbar/erro/loading | FAIL | Falta feedback recuperável ao salvar e aviso de persistência. |
| Movimento/z-index | PARTIAL | Transições presentes; verificar `prefers-reduced-motion` e foco sob elementos fixos. |

## I. WCAG 2.2 — passagem complementar

O [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) exige alvo de 24×24 CSS px ou exceção aplicável no nível AA; 44×44 px é meta interna útil, não mínimo AA. **Inspeção estática:** FAB e principais botões passam 44 px; alguns botões de 32–40 px precisam medição de espaçamento. Os nomes acessíveis de ícones da navegação e do calendário existem; a ação de duplo toque tem alternativa por teclado (Enter/Espaço), mas precisa alternativa tátil mais evidente. Foco visível está definido no CSS. Contraste de texto pequeno, ordem de foco, reflow 320 px, leitor de tela, zoom e foco oculto sob barra fixa: **NO_EVIDENCE/NEEDS_USER_TEST** sem execução instrumentada. Não há declaração de conformidade WCAG.

## J. Backlog priorizado

| P | ID | Solução e critério de aceitação |
|---|---|---|
| P0 | NEXO-H01-002 | Expor estado de gravação do IndexedDB. Simular falha: usuário vê erro, dados digitados permanecem e pode tentar salvar novamente; não mostrar “salvo” antes da confirmação. |
| P1 | NEXO-H01-001 | Snackbar não modal com valor/categoria e “Desfazer”. Salvar e desfazer sem abrir Extrato; expiração não apaga o registro. |
| P2 | NEXO-H06-003 | Tornar adicionar na data descobrível sem gesto oculto; teste: 12–13 anos consegue registrar na data sem instrução externa. |
| P2 | NEXO-H08-004 | Testar primeira viewport em 320×667 e 390×844, com dados reais; saldo e ação principal acessíveis. |
| P2 | NEXO-H04-005 | Padronizar “entrada”/“despesa” nos comandos e explicar termos de relatório; teste de compreensão com três faixas etárias. |
| P2 | NEXO-H03-006 | Oferecer restauração após excluir meta ou confirmar consequência de modo mais específico; reserva e saldo devem fechar corretamente. |
| P2 | NEXO-WCAG-008 | Medir contraste e alvos, corrigir controles reprovados, testar zoom/leitor e foco. |
| Resolvido | NEXO-H10-007 | Ajuda de Limites agora referencia o acompanhamento presente na própria página. |

## K. Cenários de teste com jovens

Usar dados fictícios, 4–6 participantes por faixa como rodada exploratória; não interpretar como amostra representativa. Registrar sucesso, tempo, erros, hesitações, retornos, ajuda pedida, compreensão do saldo e do feedback.

| Idade | Tarefa observável | Critério |
|---|---|---|
| 12–13 | “Você comprou um lanche de R$15 hoje. Registre e encontre esse gasto.” | Seleciona despesa e categoria coerente, confirma valor e localiza registro. |
| 12–13 | “Você recebeu R$20 de mesada. Registre sem contar como gasto.” | Escolhe Entrada e Mesada sem orientação. |
| 14–16 | “Você gastou R$18 em transporte ontem. Registre na data certa e corrija a categoria.” | Encontra data, registra e consegue editar. |
| 14–16 | “Você tem R$100 para passeios neste mês; defina limite e descubra quanto usou.” | Define teto e interpreta gasto/limite. |
| 17–18 | “Você recebeu R$300 do estágio; reserve R$80 para um notebook e depois libere R$20.” | Entende saldo disponível, transferência e lançamentos no Extrato. |
| Todas | “O aplicativo informou que não conseguiu salvar. O que você faria?” | Identifica falha, preserva entrada e consegue tentar novamente. |

## L. Veredicto

**READY WITH FIXES** para continuação do desenvolvimento; **não há evidência suficiente para aprovar lançamento com dados financeiros reais**. A falha silenciosa de persistência é o bloqueio técnico mais sério identificado. Depois de corrigir P0/P1, executar testes com jovens das três faixas e uma passagem WCAG em navegador. Esta avaliação por um único agente não substitui avaliadores independentes nem testes com usuários.

**Implementação após a auditoria:** o aplicativo agora informa falhas de gravação local com tentativa de novo salvamento e não abre o onboarding se a leitura dos dados falhar. Registro rápido, edição e exclusão de meta têm confirmação não modal; registro e meta excluída permitem desfazer. O calendário mostra o dia selecionado e permite novo toque na mesma data sem painel intermediário. Filtros do Extrato usam “Entradas”, e os alvos/contraste da navegação e ações de metas/limites foram ampliados. O texto desatualizado da ajuda em Limites foi corrigido. Permanecem como validações externas os testes com jovens, a medição visual de primeira viewport, contraste em todas as combinações de cor, leitor de tela e comportamento offline em aparelhos reais.
