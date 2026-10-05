# Trilhas e missões NYX

## Estrutura publicada

- Explorador: 30 etapas, da leitura do saldo à primeira revisão financeira.
- Equilibrado: 30 etapas, de conhecer o app a interpretar o mês e organizar decisões.
- Expert: 30 etapas, de configurar os dados a cruzar evidências e decidir.
- Cada perfil tem seis módulos de cinco etapas, com conceito, explicação, pergunta, prática verificável e feedback.
- Os três perfis acessam as mesmas telas e funções. O identificador interno `construtor` continua representando Expert para preservar os dados existentes; `estrategista` e `mestre` são aliases legados.

O catálogo completo, com as perguntas, respostas e atividades, está em [CONTEUDO_TRILHAS_NYX.md](CONTEUDO_TRILHAS_NYX.md).

## Progressão

`Aprender` exibe a próxima etapa não concluída. Módulos futuros aparecem desabilitados; etapas concluídas podem ser revisadas sem conceder novamente o XP. Mudar a preferência de foco não muda a ordem.

A pergunta precisa estar correta e todos os requisitos práticos precisam estar cumpridos. A resposta é salva para o usuário sair, fazer a atividade e voltar. O store também valida a ordem e o perfil; não depende apenas de botões desabilitados.

Ao iniciar uma etapa, seu marcador de eventos é persistido. Somente ações posteriores contam para essa etapa. Reabrir a página não reinicia o marcador nem perde a prática já feita. Cada requisito tem ações e parâmetros explícitos; a rota serve apenas à navegação. Consultas de duas categorias exigem entidades diferentes no mesmo mês; comparações de categoria e limite exigem a mesma categoria.

Atividades de consulta verificam a interação com a tela. Isso não comprova que o usuário interpretou os dados: a pergunta verifica o conceito separadamente. A interface não afirma verificar intenções ou pensamentos.

## Prática sem dados artificiais

- Nunca é necessário comprar, exceder um limite, provocar um erro ou duplicar um registro para avançar.
- Corrigir e desfazer têm alternativa explícita de conferir um registro correto. Um erro só deve ser corrigido quando realmente existir.
- Criar uma meta aceita a consulta dos detalhes de uma já existente.
- Práticas de aporte permitem conferir a disponibilidade sem transferir dinheiro. A transferência real também é registrada como evidência; a consulta não é apresentada como aporte realizado.
- Uma etapa que exige um gasto real aguarda um registro de despesa existente ou uma despesa real futura. Saldo inicial não passa como despesa.
- Missões de quem ainda não tem histórico ensinam consulta e preparação do registro. Não exigem gastos inventados.
- Guardar não é despesa: continua usando a transferência existente entre saldo e meta.

## Doze ciclos mensais

Há quatro missões por mês por perfil: 12 × 3 × 4 = 144 experiências anuais. Elas são práticas para realizar ao longo do mês, sem obrigatoriedade diária nem punição por não realizar aportes.

| Mês | Tema |
| --- | --- |
| Janeiro | Conheça seu dinheiro |
| Fevereiro | Organize suas categorias |
| Março | Crie limites possíveis |
| Abril | Escolhas conscientes |
| Maio | Pequenos gastos e recorrências |
| Junho | Transforme desejo em meta |
| Julho | Observe seus hábitos |
| Agosto | Planeje com o que recebeu |
| Setembro | Revise seu mês |
| Outubro | Tome decisões melhores |
| Novembro | Prepare o próximo mês |
| Dezembro | Feche o ciclo e evolua |

As competências mudam entre perfis; Expert combina investigação, comparação e intervenção, em vez de apenas exigir mais registros.

Ao abrir uma missão pela primeira vez, o motor considera o histórico existente, a maior categoria do mês, limites e metas. A amostra de registros se adapta ao volume de meses anteriores, com teto de três e respeitando a quantidade já disponível. Sem histórico, há uma atividade introdutória alternativa. O objetivo fica congelado depois da abertura, evitando uma meta que muda enquanto é executada. Valores e participação da categoria acompanhada são mostrados com os dados atuais.

Ações do próprio mês podem contar mesmo se realizadas antes de abrir a missão. Consultas de registros de outro mês não concluem uma investigação do mês atual; a atividade de comparar períodos é uma exceção explícita que registra os meses consultados. Eventos antigos não valem no próximo mês.

Os IDs incluem perfil, tema, posição, ano e mês. Reabrir ou recarregar não sorteia missões novas e não concede XP repetido. Conclusões são preservadas no histórico. Os temas reaparecem no próximo ano com um novo período: revisão financeira é cíclica, e o mesmo ciclo já concluído nunca é reemitido.

## Adequações ao aplicativo real

O documento de referência menciona previsto, mudanças de prazo e configurações de acesso. As rotas atuais não oferecem previsão financeira nem edição dos parâmetros de uma meta existente. A trilha explica a diferença entre esperado e recebido, trabalha com os registros reais e não manda o usuário a telas inexistentes. A revisão de segurança usa orientações sobre dispositivo, relatório e exclusão; não inventa uma senha própria do app.

Foi acrescentada a consulta **Detalhes** em Metas para mostrar alvo, reserva, diferença, prazo e referência mensal inicial, aproveitando os dados existentes. **Como proteger meus dados**, no Perfil, apresenta o cuidado com os dados locais. Nenhuma lição exige apagar ou compartilhar informações.

## Compatibilidade e arquivos

O XP, as conclusões antigas e os dados financeiros são preservados. As novas etapas têm IDs `trail-v2-…`; etapas antigas não são marcadas como novas competências. A tela explica essa transição quando houver histórico anterior.

| Arquivo | Responsabilidade |
| --- | --- |
| `src/data/trailLessons.ts` | 90 conteúdos, questões, seis módulos por perfil e requisitos explícitos |
| `src/data/legacyTrailLessons.ts` | Consulta dos IDs da trilha anterior |
| `src/lib/journeyMissions.ts` | Banco dos 12 ciclos, adaptação por contexto e progresso mensal |
| `src/lib/practice.ts` | Regras de evidência, sequência, entidade e período |
| `src/store/useStore.ts` | Persistência, bloqueio de saltos, abertura das missões e concessão única de XP |
| `src/pages/Learn.tsx` | Pergunta, prática, retorno e progresso da trilha |
| `src/components/journey/ProfileJourney.tsx` | Missões do mês, instruções e progresso por requisito |
| `tests/learningCurriculum.test.mjs` | Integridade dos conteúdos e testes do motor/store |

Os eventos ficam somente no armazenamento local, junto dos dados do app. Contêm ação, identificador técnico, período e sequência; não guardam os textos digitados na busca. Apagar os dados também remove respostas e evidências de aprendizado.

## Verificação desta implementação

- TypeScript, ESLint e build de produção aprovados.
- 34 testes automatizados aprovados, incluindo os testes financeiros existentes.
- Testes do store percorrem as 90 etapas, bloqueiam saltos, respostas erradas e ações anteriores; verificam XP único, contexto mensal e hidratação do histórico legado.
- Chromium: fluxo real das duas primeiras etapas de Explorador, ida e volta do registro rápido e abertura das instruções de missão, sem exceções de execução.
- Tela Aprender conferida em 320×568, 390×844, 768×1024 e 1280×800, sem transbordamento horizontal e com o botão de conclusão visível no mobile. Conteúdo longo usa rolagem interna.
- Essas verificações técnicas não substituem uma rodada de avaliação com adolescentes reais.
