# Produto e escopo

O **FinEdu Wallet** é um PWA de educação e organização financeira pessoal. Ele funciona sem login e armazena os dados no próprio dispositivo.

## Objetivo

Permitir registrar receitas e despesas, planejar compromissos, distribuir orçamento por categoria, acompanhar metas e aprender hábitos financeiros em uma experiência adaptada ao perfil da pessoa.

## Escopo entregue

- Onboarding que identifica o perfil financeiro inicial.
- Dashboard com saldo, entradas, saídas, valor previsto, saúde financeira, categorias e metas.
- Extrato com inclusão, filtros e exclusão de transações.
- Previsões com compromissos únicos, fixos e parcelados; pagamentos criam despesas no extrato.
- Orçamento mensal por categoria, regras de distribuição e acompanhamento de gasto previsto e realizado.
- Análise mensal com cards expansíveis e gráficos.
- Metas, trilha de aprendizado, desafios mensais e XP.
- Carteira de investimentos quando liberada pelo perfil.
- PWA instalável, cache de interface e dados persistidos para uso offline.

## Itens removidos

As telas e os fluxos de **Contas** (`/contas`) e **Patrimônio** (`/patrimonio`) foram removidos. Não há cadastro de contas, transferências ou ativos patrimoniais fora da Carteira.

## Perfis e navegação

| Perfil | Menu disponível |
| --- | --- |
| Explorador | Início, Extrato, Aprender, Perfil |
| Equilibrado | Início, Extrato, Previsto, Aprender, Perfil |
| Construtor | Início, Extrato, Previsto, Orçamento, Análise, Perfil |
| Estrategista | Início, Extrato, Previsto, Orçamento, Análise, Carteira, Perfil |
| Mestre | Início, Extrato, Previsto, Orçamento, Análise, Carteira, Perfil |

Em celular o menu fica na parte inferior. Em telas com pelo menos 768 px, ele se torna uma barra lateral à esquerda e o conteúdo usa o espaço disponível como dashboard.
