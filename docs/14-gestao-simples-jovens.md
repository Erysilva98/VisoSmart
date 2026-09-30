# Nexo — gestão simples para jovens

## Escopo ativo

Início, Extrato, Aprender, Metas, Limites e Perfil. As rotas antigas de análises, patrimônio/carteira, previsões e planejamento redirecionam para as áreas simples correspondentes. Os arquivos legados e os dados armazenados não foram apagados; as páginas antigas não são importadas pelo aplicativo.

No celular, o menu inferior fica oculto somente na Home. Aparece no Extrato, Aprender, Metas, Limites e Perfil. O botão de registro respeita a altura do menu. A marca Nexo retorna ao início.

## Registro e categorias

Seis categorias aparecem primeiro; as demais ficam em Mais categorias. Registro por categoria, valor/preset e salvar; descrição opcional, recentes reaproveitáveis e calendário com dois toques para datas anteriores. Não é possível lançar dinheiro futuro como recebido no cadastro rápido.

Entradas: mesada, estágio, bolsa acadêmica, freelas e bicos, salário, presentes e outros.

Despesas: alimentação, transporte, rolês e lazer, estudos, roupas e compras, apps e assinaturas, jogos, saúde, casa e contas, outros.

Cartão deixou de ser oferecido como categoria nova. Registros antigos continuam identificados e podem ser reclassificados manualmente. Não é possível inferir automaticamente o motivo de uma compra antiga.

Confirmação de registro informa o impacto no limite do mês correspondente, ou a quantidade e o total da categoria sem orçamento. Há Desfazer no aviso e após excluir pelo Extrato. Registrar transações e criar metas não gera XP.

## Dinheiro e metas

Resultado do mês = entradas menos saídas do período selecionado.

Total registrado até hoje = saldo inicial + receitas registradas até hoje − despesas registradas até hoje.

Livre pelos registros = total registrado − reservas das metas.

São cálculos locais, não uma consulta bancária. Contas futuras e investimentos independentes arquivados não entram nesse valor. A interface explica essa distinção. O saldo inicial pode ser informado no onboarding e ajustado no Perfil, sem criar receita.

Separar dinheiro para uma meta reduz o livre e não muda o total. O valor não pode superar o dinheiro livre registrado ou o que falta para a meta. Liberar a reserva faz o movimento inverso, sem criar receita. Uma compra feita com o valor liberado deve ser registrada como despesa. Excluir a meta libera sua reserva.

Dados antigos inconsistentes não são corrigidos por suposição: o usuário pode revisar o saldo inicial, o extrato e suas reservas. Carteiras e compromissos legados ficam preservados no estado exportável; o Perfil informa sua presença.

## Interpretação e planejamento

A Home destaca a maior categoria de despesas e até dois limites ultrapassados, no mês selecionado. Não interpreta automaticamente um gasto alto como erro ou a sobra como poupança.

Limites por categoria são recorrentes e opcionais. O usuário escolhe um valor com base no realizado; pode alterá-lo ou removê-lo. A regra 50/30/20 é uma referência explicada em ajuda: necessidades, desejos e escolhas, economia. A distribuição automática igual entre todas as categorias foi retirada. Limites legados permanecem salvos; o antigo limite de economia não é confundido com dinheiro realmente reservado.

## Aprendizado

Cinco práticas curtas e distintas substituem a trilha repetitiva visível. Uma prática fica em foco por vez; as concluídas podem ser revisitadas. A conclusão exige a condição de prática e uma resposta correta à pergunta de compreensão. Nenhuma prática exige gastar dinheiro novo. Ações históricas podem servir de exemplo, mas não dispensam a pergunta.

Histórico e pontos antigos são preservados. Não há ranking, pontuação por registros, promoção automática ou painel de XP na experiência simplificada. Essas verificações são indícios de compreensão, não certificação de competência financeira.

## Dados e validação

IndexedDB e sua chave permanecem iguais. Exportação JSON inclui os dados legados. A importação automática continua fora desta versão e isso é informado no Perfil.

Testes: TypeScript, ESLint dos arquivos alterados, build/PWA e `node --test tests/financialSummary.test.mjs tests/transactionView.test.mjs tests/budgetStrategy.test.mjs` (16 casos). A distribuição percentual ainda é coberta pelos testes de compatibilidade, mas não é aplicada automaticamente na interface.

Verificação em navegador com dados isolados: onboarding curto; entradas e despesas; impacto de limite e desfazer; data histórica; totais filtrados; reserva e liberação sem nova receita; pergunta de compreensão; preservação de categorias e carteiras legadas; redirecionamentos; navegação mobile por tela. Layouts conferidos em 320, 390 e 1440 pixels.
