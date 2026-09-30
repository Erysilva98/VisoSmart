# FinEdu — identidade e jornada

## Direção visual

Uma experiência jovem de aprendizado e organização. Superfícies brancas sobre fundo off-white, tipografia forte, bordas discretas, sombras leves e componentes com espaçamento consistente. Cor comunica ação e progresso, em vez de preencher todos os cards.

- Marca: verde `#00A86B`; verde escuro nas ações com texto branco para manter legibilidade.
- Explorador: verde; descoberta.
- Equilibrado: azul; organização.
- Expert: roxo; estratégia. O identificador interno `construtor` foi mantido para preservar os dados existentes.
- Aprendizado: azul. Evolução: roxo. Metas: amarelo.
- Ícones Lucide e animações Framer Motion com respeito à preferência por movimento reduzido.

## Jornada implementada

1. Apresentação e onboarding com cinco perguntas, seleção explícita, retorno às respostas e resultado sem nota ou ranking.
2. Início compacto com saldo do mês, entradas e saídas, atalhos, categorias e três registros recentes do período selecionado.
3. Registro rápido: categoria → preset/valor → salvar. Um gasto recente preenche valor, categoria e descrição. Descrição opcional, valores validados e confirmação após registrar.
4. Aprender com trilha em três módulos, etapas concluídas/atuais/futuras, leitura, missão prática e conclusão validada pelo histórico.
5. Metas com título próprio, ícone, valor, prazo, acompanhamento, registro do valor guardado e confirmação de exclusão.
6. Perfil com habilidades verificáveis, dias de prática, XP de participação, missões e conquistas derivadas dos dados reais.

Navegação principal estável: Início, Extrato, Aprender, Metas e Perfil. Ferramentas de planejamento, limites e análises permanecem acessíveis a partir do contexto do perfil. No celular, a missão atual vem antes do mapa da trilha; no desktop, aparecem lado a lado.

## Regras preservadas e esclarecidas

- Os registros, metas e aprendizado continuam salvos localmente. Nenhum exemplo financeiro é inserido como dado do usuário.
- IDs das 30 etapas por perfil e das aulas legadas foram preservados. Os textos foram reescritos com acentuação correta e linguagem cotidiana.
- Etapas futuras ficam bloqueadas; as concluídas podem ser revisitadas sem gerar XP novamente.
- A interface informa quando registros anteriores já atendem à prática. Concluir a leitura continua sendo uma ação explícita.
- XP representa participação, não inteligência financeira. O perfil continua baseado no onboarding; não há promessa de promoção automática por pontos.
- Conquistas e habilidades refletem o histórico atual. A remoção de registros pode alterar seu progresso.
- As metas criam registros internos de reserva; esses itens não devem, sozinhos, substituir o saldo do extrato no início.
- Exportação JSON permite guardar uma cópia dos dados. Não há fluxo de importação nesta alteração.

## Referências visuais consultadas

- [shadcn/ui](https://ui.shadcn.com/): componentes limpos e organização de superfícies.
- [Aceternity UI](https://ui.aceternity.com/): transições e apresentação inicial.
- [Tremor](https://www.tremor.so/): indicadores e gráficos econômicos.
- [Magic UI](https://magicui.design/): detalhes visuais memoráveis.
- [Linear](https://linear.app/): hierarquia tipográfica e organização.
- [Duolingo](https://www.duolingo.com/) e [Habitica](https://habitica.com/): referência solicitada para progressão e prática.

A implementação usa React, Tailwind, Lucide e Framer Motion já presentes no projeto. As referências orientam a composição; não foi adicionada dependência de suas bibliotecas.

## Verificação

Checagem TypeScript, build de produção/PWA e ESLint dos arquivos do redesign. Testes em navegador com perfil isolado cobrem onboarding, presets, conclusão de aula elegível, bloqueio de etapas, criação e aporte em meta, conquistas, cancelamento de exclusão de dados, os três perfis e persistência após recarregar. Layouts inspecionados em 320, 390, 768 e 1440 pixels.

## Prévias

Capturas de navegador feitas com dados de teste em um perfil isolado; não alteram os dados locais do usuário.

- [Home no desktop](previews/finedu-home-desktop.png)
- [Home no celular](previews/finedu-home-mobile.png)
- [Extrato filtrado no celular](previews/finedu-extrato-mobile.png)
- [Trilha de aprendizado](previews/finedu-trilha-desktop.png)

## Ajuste da estratégia e do início

- Regra única para todos os perfis: 50% despesas essenciais, 30% gastos fixos e variáveis, 20% economia. Gastos acima da referência não alteram os percentuais automaticamente.
- Orçamento mostra a divisão e permite aplicá-la aos limites. O cálculo e a distribuição entre categorias preservam os centavos; os limites existentes só são substituídos ao aplicar a regra.
- Ícones e cores de categorias são consistentes no registro rápido, nas barras da Home e no histórico recente.
- Frase “Seu futuro começa no dia a dia” movida para a navegação; saudação removida e mês centralizado.
- Botão textual de registrar removido do saldo. O botão flutuante “+” permanece disponível no celular e no desktop.
- Regressão da estratégia: `node --test tests/budgetStrategy.test.mjs`. Verificação em navegador cobre aplicação e persistência do plano nos três perfis, cores, menu e acesso ao registro em 320, 390 e 1440 pixels.

## Home compacta e extrato mensal

- Home e Extrato compartilham o seletor de mês centralizado, com anterior e próximo, inclusive na virada do ano. O mês fica na URL e é preservado ao recarregar.
- Saldo do mês significa entradas menos saídas daquele período. Indicadores, categorias e registros recentes acompanham o mês selecionado; meses sem registros mostram zero.
- Ícones, tipografia e espaçamentos menores priorizam o essencial. Planejamento, metas e aprendizado têm atalhos em uma linha; evolução e conquistas continuam em suas áreas.
- Tocar em entradas, saídas ou categoria abre o Extrato no mesmo mês, com o filtro correspondente.
- Os totais do Extrato são calculados a partir dos registros exibidos, combinando mês, tipo, categoria e busca. A busca ignora acentos e diferenciação entre maiúsculas e minúsculas. Edições e exclusões atualizam os totais imediatamente.
- Referência funcional: [Super Extrato Inter](https://ajuda.inter.co/conta-digital-pessoa-fisica-e-mei/quais-as-funcoes-disponiveis-no-super-extrato), mantendo a identidade visual do FinEdu.
- Validação: TypeScript, ESLint dos arquivos alterados, build de produção e dez testes com `node --test tests/transactionView.test.mjs tests/budgetStrategy.test.mjs`. Navegador em 320, 390 e 1440 pixels: navegação mensal, virada do ano, mês vazio, filtros combinados, busca, edição, exclusão e acesso ao registro rápido.
