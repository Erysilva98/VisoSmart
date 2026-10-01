# Variações da Home — auditoria de UX

As cinco propostas compartilham os mesmos dados, ações, cabeçalho, navegação inferior, calendário, fluxo de registro rápido e estado de privacidade. O seletor **Explorar versões da Home** fica no fim da página e usa `?home=1` a `?home=5`; a navegação principal permanece igual. A V5 é o padrão quando o parâmetro não existe.

## V1 — Clean Balance

- **Conceito e hierarquia:** saldo grande em card branco → entradas e gastos → interpretação → quatro ações → próximo passo.
- **Vantagem:** leitura imediata, poucos elementos e boa separação entre informação e ação.
- **Ponto de atenção:** a representação numérica exige mais interpretação do que a V2; o calendário fica como conteúdo secundário.
- **Heurísticas mais evidentes:** 1 (estado), 2 (linguagem), 6 (ações com rótulos), 8 (minimalismo).

## V2 — Saldo Visual

- **Conceito e hierarquia:** saldo e anel de proporção livre → entradas e gastos → orientação → ações → gasto recente.
- **Vantagem:** oferece um segundo sinal visual sem depender só da cor; o percentual tem rótulo e texto alternativo.
- **Ponto de atenção:** o percentual não é mostrado sem entradas suficientes para estabelecer uma base; saldo negativo é comunicado em texto.
- **Heurísticas mais evidentes:** 1, 2, 6, 8.

## V3 — Aprender em Destaque

- **Conceito e hierarquia:** saldo compacto → próxima etapa da trilha → entradas e gastos → ações → registro recente.
- **Vantagem:** deixa claro que aprender é a próxima ação e informa título, duração e progresso.
- **Ponto de atenção:** o card da trilha ocupa mais altura que nas outras versões; em aparelhos baixos, os registros podem ficar após a primeira dobra.
- **Heurísticas mais evidentes:** 1, 6, 7 (acesso direto), 8, 10 (ajuda contextual).

## V4 — Extrato em Destaque

- **Conceito e hierarquia:** saldo → até três categorias com proporção e valor → último gasto → orientação → ações.
- **Vantagem:** responde rapidamente para onde foi o dinheiro e leva ao Extrato em um toque.
- **Ponto de atenção:** é a versão com maior densidade; o resumo de categorias fica vazio até existir uma despesa real.
- **Heurísticas mais evidentes:** 1, 2, 6, 7, 8.

## V5 — Cartão Interativo

- **Conceito e hierarquia:** saldo e pizza do percentual gasto → frase curta → maior gasto em valor e categoria → entradas e gastos → Extrato, Aprender, Metas e Limites → desafio da trilha.
- **Vantagem:** o gráfico começa em 0% e cresce com os gastos; fica amarelo acima de 70% e vermelho acima de 90%. O maior gasto aparece em uma frase simples. O desafio apresenta duração, XP e progresso.
- **Ponto de atenção:** o gráfico mede gastos como proporção das entradas do mês. Reserva para metas não é despesa e não aumenta esse indicador, embora reduza o saldo livre mostrado ao lado. Sem entradas, a pizza mostra “—”.
- **Heurísticas mais evidentes:** 1, 2, 6, 8.

## Matriz de comparação

Escala: **alto** = critério mais forte na proposta; **médio** = presente sem ser dominante; **baixo** = propositalmente reduzido. Em "carga cognitiva", baixo é favorável.

| Critério | V1 | V2 | V3 | V4 | V5 |
|---|---|---|---|---|---|
| Destaque do saldo | alto | alto | médio | médio | alto |
| Clareza do estado | alto | alto | médio | alto | alto |
| Aprender | médio | médio | alto | médio | alto |
| Extrato | médio | médio | médio | alto | alto |
| Acesso rápido | alto | alto | alto | alto | alto |
| Carga cognitiva | baixa | média | média | alta | média |
| Minimalismo | alto | médio | médio | médio | médio |
| Gamificação leve | baixa | média | alta | baixa | média |
| Educação financeira | média | alta | alta | alta | alta |
| Adequação mobile | alta | alta | média | média | alta |

## Checklist comum das dez heurísticas de Nielsen

1. **Visibilidade do estado:** saldo, entradas, gastos, progresso da trilha e mensagens mudam com os dados.
2. **Correspondência com o mundo real:** rótulos como "Entrou", "Gastou" e "Disponível para suas escolhas" evitam termos bancários.
3. **Controle e liberdade:** ocultar valores, trocar mês e versão, desfazer o registro pelo aviso e confirmar exclusões permanecem disponíveis.
4. **Consistência:** cards, tipografia, atalhos, navegação inferior e cores seguem o mesmo sistema em todas as propostas.
5. **Prevenção de erros:** percentual fica indisponível sem base; exclusão mantém confirmação e cadastro mantém validações existentes.
6. **Reconhecimento:** ícones sempre acompanham rótulos; a V4 mostra categorias com nome e valor.
7. **Eficiência:** Registrar segue disponível pelo botão flutuante "+"; na V5, o acesso rápido prioriza Extrato, Aprender, Metas e Limites.
8. **Estética minimalista:** cada proposta prioriza um foco e mantém calendário e detalhes financeiros abaixo do resumo principal.
9. **Recuperação de erros:** avisos, desfazer e confirmação de exclusão são compartilhados com o restante do app.
10. **Ajuda contextual:** frase financeira e próximo passo orientam sem exigir leitura longa; a trilha ensina uma etapa por vez.

## Ajustes após a pesquisa de personas

O material recebido descreve **personas e entrevistas fictícias**, não resultados de testes com participantes reais. Os layouts foram refeitos como hipóteses de design para comparação, mantendo o mesmo estado e as mesmas ações do Nexo:

- V1 reforça o valor numérico e o próximo passo.
- V2 coloca saldo e percentual no centro do indicador circular; sem entrada registrada, evita inventar uma porcentagem.
- V3 mostra uma missão por vez, com duração, progresso e chamada direta para continuar.
- V4 mostra categorias com barras curtas e até três gastos recentes, com acesso direto ao Extrato.
- V5 apresenta saldo e pizza de gastos ao lado, maior categoria em frase curta, atalhos e desafio da trilha; remove a saudação duplicada.

O botão flutuante e os quatro atalhos continuam. A Home mantém o calendário e o acesso a categorias abaixo do resumo principal. Nenhum cálculo, registro ou regra de progresso foi modificado para esta revisão.

**Verificação realizada:** análise dos componentes e rotas, lint, TypeScript, build de produção e prévia no Chrome em 360×800, 375×812, 390×844, 393×852 e 414×896 para as cinco versões. Nessas resoluções, o documento não apresentou rolagem horizontal e os atalhos ficaram acima da navegação inferior; ajustou-se a V4 após observar o botão flutuante próximo ao valor do último gasto. Testes com usuários reais permanecem fora desta verificação.
