# Questionário, trilha e missões

Esta revisão restaura a progressão educativa e substitui a orientação anterior de retirar XP do Perfil. Registrar gastos ou receitas continua sem conceder pontos.

## Cinco perguntas com efeitos reais

1. Experiência com dinheiro: define Explorador, Equilibrado ou Expert e a ordem dos módulos.
2. Fontes de entrada e frequência: prioriza categorias como mesada, estágio e bolsa e salva a frequência da renda.
3. Categorias de despesa: coloca as escolhas primeiro no registro rápido, mantendo as demais disponíveis.
4. Objetivo atual: orienta o próximo passo, a trilha e as missões. Alterações preservam as missões do mês em andamento.
5. Dinheiro disponível: cria uma entrada identificada como Saldo inicial. Revisar o questionário atualiza essa mesma entrada, sem duplicação.

O saldo inicial entra no dinheiro disponível e aparece no Extrato e no calendário. Não é renda nova para os cálculos de receita mensal. Totais filtrados no Extrato continuam somando os itens visíveis, com aviso quando incluem saldo inicial. Saldos antigos são migrados sem somar o mesmo dinheiro duas vezes.

## Evolução

- Perfil apresenta quatro missões mensais, progresso, nível de prática e conquistas.
- Trilha visual com 18 etapas em três módulos: compreender dinheiro, usar o app e melhorar decisões.
- Conteúdo inclui categorias, gastos fixos e variáveis, assinaturas, renda irregular, calendário, filtros, limites, metas, reservas e compras por impulso.
- Etapas exigem resposta correta; práticas específicas também verificam o uso da função.
- Cada etapa concede XP uma vez. Revisões podem contar para a missão mensal sem repetir o XP da etapa. Cada missão pode ser concluída uma vez no mês.
- Histórico financeiro e progresso anterior são preservados. As funções financeiras continuam acessíveis independentemente da etapa da trilha.

## Validação

21 testes automatizados aprovados; TypeScript, ESLint dos arquivos alterados e compilação de produção aprovados. Navegador local: cinco perguntas, persistência das categorias, revisão do saldo sem duplicação após recarregar, quatro missões, conclusão de duas etapas e uma missão, revisão repetida sem XP adicional. Perfil e trilha conferidos em 320, 390 e 1440 pixels, sem transbordamento horizontal ou exceções de execução.

A validação confirma o comportamento implementado; impacto em retenção precisa ser medido com usuários.
