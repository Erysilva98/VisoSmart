# Categorias pessoais, relatório e identidade da PWA

- A janela de cadastro rápido permanece. A confirmação flutuante após salvar foi removida conforme esclarecimento do usuário.
- Com preferências definidas, o cadastro e os registros recentes mostram somente categorias selecionadas para o tipo de entrada ou despesa. Sem preferências antigas, mantém-se a lista padrão. Seleção vazia mostra um caminho para configurar no Perfil.
- Minhas categorias permite marcar/desmarcar, criar e editar nome, cor e ícone. As mudanças são aplicadas ao salvar. IDs estáveis preservam as transações, limites, filtros, calendário e gráfico; desmarcar não apaga histórico. Nomes são limitados a 40 caracteres e duplicatas do mesmo tipo são rejeitadas.
- “Rever meu perfil” foi removido, e o questionário inicial não abre novamente para usuários que já o concluíram.
- “Seus dados” baixa um PDF de todo o histórico, com saldo inicial separado das receitas, saldo disponível e reservas, metas com descrição/título, valor, prazo e percentual, gráfico de despesas por categoria e registros detalhados. O arquivo tem paginação e datas com ano. O PDF é gerado no dispositivo, sem envio dos registros a um servidor.
- O gráfico da Home usa rosca, legenda lateral, cores, percentuais e valores. Fatias e nomes abrem o Extrato com tipo despesa, categoria e mês selecionados. Fatias também respondem a Enter/Espaço. Ocultar valores esconde distribuição, percentuais e quantias.
- Manifesto, atalho da PWA, favicon e Apple Touch Icon usam arquivos versionados do N Trilha. O antigo arquivo de ícone de carteira também passa a conter o N. O ícone exibido em instalações existentes depende da atualização do manifesto pelo navegador/sistema.

## Validação

22 testes automatizados aprovados, TypeScript e ESLint dos arquivos alterados aprovados, build de produção aprovado. Navegador: criar/editar/desmarcar categoria e recarregar preservando os registros; cadastro somente com selecionadas; ausência da confirmação; clique em fatia e legenda filtrando valores; bloqueio de retorno ao onboarding; PDF baixado com saldo, meta, percentual, categoria personalizada e múltiplas páginas; manifesto e favicon versionados. Layout conferido em 320, 390 e 1440 pixels.

As prévias e o PDF de exemplo em `docs/previews` usam dados fictícios.

Geração do PDF implementada com a [API oficial do jsPDF](https://parallax.github.io/jsPDF/docs/jsPDF.html).
