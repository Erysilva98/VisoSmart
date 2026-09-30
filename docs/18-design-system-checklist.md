# Nexo — checklist de design system e UX

Referência visual: protótipo mobile enviado pelo produto. Direção: leve, jovem, com foco em uma informação, uma decisão e uma próxima ação. A Home dispensa avatar.

## Tokens e componentes

- [x] Tipografia Inter, títulos curtos e escala de texto consistente.
- [x] Superfícies claras, bordas discretas e raio comum para cards.
- [x] Azul para ações e navegação; verde para entradas; vermelho para saídas; cores próprias para categorias e metas.
- [x] Ícones Lucide com traço arredondado e rótulos nas ações principais.
- [x] Foco visível, rótulos acessíveis e suporte a movimento reduzido.
- [x] Atalhos com área de toque suficiente, mesmo em layout compacto.
- [x] Home sem avatar e sem barra inferior no celular; barra disponível nas demais telas.

## Fluxos e conteúdo

- [x] Home: mês, entradas, saldo central, gastos, atalhos, calendário e categorias em ordem de decisão.
- [x] Alerta financeiro no Extrato, acessível pelo triângulo; totais mensais estáveis ao filtrar e soma separada dos resultados.
- [x] Calendário conserva receitas e despesas, abre registros por dia e aceita dois toques para registrar naquela data.
- [x] Gráfico mantém todas as fatias clicáveis; legenda inicial destaca as três maiores categorias, com acesso ao extrato completo.
- [x] Registro rápido oferece categorias selecionadas, valores prontos, recentes e descrição opcional.
- [x] Trilha mostra uma aula por vez; atividades no app liberam a conclusão, conforme o conteúdo e o perfil.
- [x] Aprender usa a altura útil do celular; texto de apoio fica recolhido e o botão de conclusão permanece visível.
- [x] Extrato troca a lista extensa de categorias por um seletor visual de ícones; o total filtrado aparece no próprio controle.
- [x] Metas mostra ícones de criação na página; escolher um deles abre o cadastro com o sonho preenchido, seguido de valor, prazo e salvar.
- [x] Metas existentes aparecem em cards curtos com progresso e ação de guardar.
- [x] Perfil mostra o mês nas missões e resume as quatro em grade; conquistas e dados detalhados ficam sob demanda.
- [x] Aportes e saques de metas aparecem no Extrato como transferências com ícones próprios; receitas, despesas e limites excluem essas movimentações.
- [x] Limites sugeridos aparecem como quatro categorias com ícones, seguidas de expansão.
- [x] Metas sugeridas mostram quatro ícones por padrão, seguidos de expansão; Guardar e Liberar são botões explícitos.
- [x] Detalhes financeiros ficam em sobreposição, com retorno à Home.
- [x] Estados vazios orientam a primeira ação.

## Critérios de revisão por tamanho

- [x] Home usa espaçamento compacto e células menores de calendário em telas de celular.
- [x] Em alturas curtas, reduz espaços e preserva os controles essenciais. O conteúdo pode rolar se a fonte do sistema estiver ampliada: não se deve cortar informações nem botões.
- [x] Ações principais continuam operáveis pelo teclado e leitores de tela.
- [ ] Conferência visual manual em dispositivo real antes da publicação (320 × 568, 390 × 844 e fonte ampliada).

## Heurísticas de Nielsen aplicadas

1. **Visibilidade do estado:** resultado mensal, receitas, despesas, alerta e progresso da missão aparecem na Home.
2. **Correspondência com o mundo real:** rótulos como “Entrou”, “Saiu”, “Livre hoje” e “Próximo passo”.
3. **Controle e liberdade:** mês anterior/próximo, fechar detalhes e voltar da segunda etapa do registro.
4. **Consistência:** as mesmas cores, ícones e rótulos sinalizam entradas, despesas e navegação.
5. **Prevenção de erros:** registro valida valor, categoria e data antes de salvar.
6. **Reconhecimento em vez de memorização:** categorias, valores frequentes e registros recentes ficam à vista.
7. **Flexibilidade e eficiência:** atalhos, valores prontos e dois toques no calendário.
8. **Estética e minimalismo:** três categorias na legenda inicial; detalhes sob demanda.
9. **Recuperação de erros:** entradas inválidas exibem instruções no próprio fluxo de registro.
10. **Ajuda e documentação:** instrução curta para o gesto do calendário e explicações sob demanda para o saldo livre.
