# Prompt técnico — evolução do FinEdu Wallet para jovens

Você é uma pessoa desenvolvedora full-stack sênior responsável por evoluir o **FinEdu Wallet**, um PWA offline de educação e organização financeira para jovens brasileiros. Analise primeiro a pasta `docs/` e o código existente antes de alterar qualquer arquivo. Preserve as funcionalidades já entregues, a persistência local e a navegação por perfis.

## Objetivo do produto

O produto não deve parecer uma planilha financeira para adultos. A experiência deve ajudar a pessoa a:

1. registrar um movimento financeiro em poucos segundos;
2. entender imediatamente o impacto desse movimento;
3. executar uma pequena ação prática de aprendizado;
4. perceber progresso em metas, orçamento e hábitos;
5. liberar recursos conforme a maturidade financeira evolui.

Use linguagem simples, acolhedora e não moralizante. Evite termos técnicos sem explicação, punições, streaks agressivos, rankings e recompensas por tempo de tela. XP deve recompensar aprendizagem ou ação financeira útil, nunca permanência no aplicativo.

## Restrições obrigatórias

- Todo texto deve estar em **UTF-8 e pt-BR**, sem caracteres corrompidos como `Ã§`, `Ã£` ou `Â`.
- O aplicativo deve continuar 100% utilizável offline, sem login, sem backend e sem chamadas externas para o funcionamento principal.
- Dados devem continuar persistidos no dispositivo por IndexedDB/local persistence.
- Não adicionar publicidade, recomendação de produtos financeiros, rastreamento comportamental ou sincronização em nuvem.
- Preservar os perfis e menus progressivos: Explorador, Equilibrado, Construtor, Estrategista e Mestre.
- Não restaurar as páginas removidas de Contas e Patrimônio. A Carteira é a única área para saldo, reserva, metas e investimentos.
- Em celular, usar navegação inferior e modais centralizados. Em tablet e desktop, usar a navegação lateral e layout de dashboard.

## Prioridade 1 — registro de transação com baixa fricção

Revise o modal de nova transação para reduzir a tarefa comum a três decisões: **tipo, valor e categoria**.

### Requisitos

- Abrir como **Entrada** se ainda não houver receita registrada; caso contrário, abrir como **Despesa**.
- Permitir alternar Entrada/Despesa em um controle destacado: verde para Entrada, vermelho para Despesa.
- Valor e categoria são obrigatórios. Data deve iniciar como hoje; descrição deve ser opcional.
- Mostrar categorias recentes e usadas com frequência como ícones em uma grade que nunca ultrapasse a largura da tela.
- Manter detalhes avançados em “Mais opções”: data diferente, previsto e parcelamento.
- Trocar qualquer CTA genérico como “Continuar” por uma ação explícita, por exemplo “Salvar R$ 18,00”.
- Após salvar, não abrir modal educativo bloqueante. Mostrar feedback breve e reversível na própria interface: valor, categoria, efeito no orçamento e ação “Desfazer”.
- Se houver orçamento para a categoria, informar gasto realizado, limite e saldo restante. Se não houver, informar de forma neutra que o app está formando um padrão de gastos.

### Critérios de aceite

- Uma despesa comum pode ser salva com valor + categoria, sem preencher descrição ou data.
- Uma transação recém-salva pode ser desfeita sem navegar para outra tela.
- O texto após o registro não culpa a pessoa por ultrapassar limites.

## Prioridade 2 — início como estado, explicação e próximo passo

Redesenhe a tela inicial para responder claramente, em linguagem humana:

- quanto tenho disponível agora;
- quanto entrou e saiu no mês;
- o que já está comprometido/previsto;
- como estou neste mês e qual é o próximo passo útil.

### Requisitos

- Para o perfil Explorador, não usar score numérico como mensagem principal. Mostrar estado explicável, por exemplo “Tudo sob controle”, “Atenção aos gastos” ou “Vamos registrar mais movimentos”.
- O card de saúde financeira deve explicar o motivo da mensagem, usando dados reais: orçamento, maior categoria de gasto, entradas, saídas e previsões.
- Mostrar apenas uma missão principal de aprendizado por vez, com progresso visível e ação clara.
- Gráficos detalhados devem aparecer abaixo da informação essencial ou apenas após dados suficientes.
- Ao tocar numa categoria do gráfico, navegar para o Extrato com o filtro correspondente.
- Manter o card de sugestões abaixo das categorias, com recomendações breves e contextualizadas. Não inserir o botão de aporte de meta nesse card: o aporte pertence ao card da própria meta.

### Critérios de aceite

- Uma pessoa sem experiência financeira consegue identificar saldo, gasto do mês e próxima ação sem interpretar gráficos.
- O estado financeiro não depende apenas de um número como “80/100”.

## Prioridade 3 — aprendizado por missão prática

Transforme Aprender em uma trilha de uma única etapa ativa, e não em uma biblioteca de aulas concorrentes.

### Requisitos

- Mostrar etapa atual, habilidade que será desenvolvida, conteúdo curto, missão prática, progresso e XP.
- Só liberar a conclusão após validar comportamento real no estado do aplicativo, como registrar gastos, usar categorias, definir orçamento ou criar meta.
- Ao concluir, exibir uma síntese útil baseada nos dados da pessoa e só então liberar a próxima etapa.
- A progressão de perfil não pode depender apenas de XP. Exigir também competências observáveis, por exemplo: registrar em dias diferentes, usar categorias, criar uma meta e definir um limite quando aplicável.
- Manter os desafios mensais, mas garantir que tenham propósito prático e não repitam tarefas em excesso.

### Critérios de aceite

- Há apenas uma missão principal em destaque.
- Nenhuma missão marca conclusão apenas por abrir uma tela ou permanecer no app.
- O perfil apresenta claramente quais competências faltam para evoluir.

## Prioridade 4 — previsto e planejamento compreensível

Simplifique a tela Previsto para jovens.

### Requisitos

- Substituir linguagem burocrática como “Anote suas despesas” por uma pergunta orientada à situação: “O que você já sabe que vai pagar?”.
- Ao adicionar, mostrar três opções visíveis em vez de um seletor escondido: **Uma vez**, **Todo mês** e **Parcelado**.
- Uma vez: nome, valor e data.
- Todo mês: nome, valor e dia de vencimento; permitir recorrência mensal, semanal ou quinzenal quando aplicável.
- Parcelado: nome, valor total e quantidade de parcelas. Calcular automaticamente valor de cada parcela, próximos vencimentos e rótulos como `2/6`.
- Ao marcar uma previsão como paga, criar despesa no Extrato, remover esse valor do previsto pendente e atualizar orçamento e início.
- Na exclusão, permitir escolher “Somente esta ocorrência” ou “Esta e as próximas”, sem alterar ocorrências anteriores.
- O resumo superior deve comparar compromissos com a renda quando ela existir; sem renda, explicar que é preciso registrar uma entrada para avaliar o impacto.

## Prioridade 5 — orçamento como sugestão flexível

Mantenha o orçamento por categoria, mas trate regras de distribuição como orientação, não bloqueio.

### Requisitos

- Agrupar categorias em **Essencial**, **Objetivos e reserva** e **Qualidade de vida**.
- Cada grupo deve mostrar percentual recomendado, valor sugerido e valor atualmente distribuído.
- Ao aplicar estratégia, distribuir os valores sugeridos entre as categorias elegíveis de cada grupo.
- Ao remover uma categoria, redistribuir o valor liberado entre as categorias restantes do mesmo grupo.
- Ao clicar no valor de uma categoria, abrir modal centralizado para editar o limite.
- A sugestão não bloqueia edição manual. Limitar cada valor manual a no máximo duas vezes a renda registrada no mês.
- Se a soma do plano ultrapassar a renda mensal, manter os valores, mas destacar todo o acompanhamento em vermelho e explicar como equilibrar o orçamento.
- Barras: gasto realizado na cor da categoria; trilho de definição de limite em cinza com marcador na cor da categoria; gasto previsto em cinza quando existir.
- Investimentos/Economia deve permanecer como objetivo de economia, sem ser tratado como gasto realizado por transação comum.

## Prioridade 6 — metas integradas à Carteira

Metas são objetivos concretos de poupança, não uma categoria de gasto.

### Requisitos

- “Nova meta” fica acima da lista de metas.
- Abrir a criação em modal centralizado, sobrepondo a lista; fechar ao cancelar ou concluir.
- Criar meta por ícone de objetivo, valor-alvo e quantidade de meses. Não solicitar categoria nem data específica.
- Usar ícones concretos e cores próprias: casa, veículo, viagem, estudos e realização.
- Ao criar uma meta, criar também um item protegido correspondente na Carteira, fora do saldo disponível.
- Mostrar objetivo, ícone, valor atual, valor-alvo, percentual concluído, prazo em meses, aporte mensal necessário e botão “Fazer aporte”.
- O botão “Fazer aporte” deve ficar no card da meta após sua criação. O aporte atualiza tanto a meta quanto o item vinculado na Carteira.
- Transferências para ou a partir do item vinculado devem atualizar o progresso da meta.
- Excluir uma meta remove seu item protegido da Carteira.
- Ao criar, ordenar metas por menor prazo. Oferecer setas para mover cada meta para cima ou para baixo e persistir a ordem escolhida.

## Prioridade 7 — Carteira organizada por finalidade

Organizar o card “Minhas carteiras” em grupos, nesta ordem:

1. Saldo;
2. Metas;
3. Reservas;
4. Investimentos.

### Requisitos

- Saldo disponível: ícone de carteira, verde.
- Meta: usar o mesmo ícone e cor escolhidos ao criar a meta.
- Reserva: ícone de escudo, azul.
- Investimento: ícone de instituição financeira, amarelo/âmbar.
- Exibir a finalidade e se o valor está disponível ou protegido.
- Manter transferência entre itens, sem reintroduzir página de Contas.
- O valor de metas, reservas e investimentos protegidos não entra no saldo disponível por padrão.

## Qualidade, documentação e validação

- Corrigir todos os arquivos com texto corrompido e garantir UTF-8 de ponta a ponta.
- Atualizar `docs/01-produto-e-escopo.md`, `docs/03-funcionalidades.md`, `docs/04-aprendizado-e-desafios.md`, `docs/05-dados-e-pwa.md` e `docs/08-redesign-jornada-e-baixa-friccao.md` para refletir o comportamento final. Remover afirmações antigas que contradigam a Carteira com transferências, metas vinculadas ou regras atuais de orçamento.
- Documentar decisões de regra de negócio em comentários curtos perto do código que calcula previsão, orçamento, meta vinculada e progressão de perfil.
- Executar `npm.cmd run typecheck` e `npm.cmd run build` ao final. Corrigir erros antes de encerrar.
- Não considerar o aviso de tamanho de chunk como erro de compilação, mas registrar qualquer impacto relevante e evitar regressões de carregamento.

## Definição de pronto

Considere o trabalho concluído somente quando os fluxos acima funcionarem offline, persistirem após recarregar a aplicação, mantiverem layout responsivo em celular/tablet/desktop, não apresentarem texto corrompido e passarem em typecheck e build.
