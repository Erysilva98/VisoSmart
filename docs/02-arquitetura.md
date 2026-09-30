# Arquitetura

## Stack

- React 18, TypeScript e Vite.
- Tailwind CSS para a interface.
- React Router com `HashRouter`, compatível com GitHub Pages.
- Zustand para estado global.
- IndexedDB, via `idb`, para dados locais.
- Framer Motion e Recharts para interação e gráficos.
- `vite-plugin-pwa` para manifesto e Service Worker.

## Estrutura

```text
src/
  components/ui/  layout, menu, modal de inclusão e componentes reutilizáveis
  data/           perfis, categorias, aulas, perguntas e desafios
  lib/            cálculos, regras de previsão, progresso, formatação e IndexedDB
  pages/          telas roteadas
  store/          estado e ações do aplicativo
  types/          contratos de dados persistidos
```

## Rotas ativas

| Rota | Tela |
| --- | --- |
| `/` | landing ou redirecionamento para o painel |
| `/onboarding` | diagnóstico de perfil |
| `/dashboard` | início |
| `/gastos` | extrato |
| `/previsoes` | compromissos previstos |
| `/orcamentos` | orçamento mensal |
| `/analises` | análise |
| `/metas` | metas |
| `/aprender` | trilha de aprendizado |
| `/perfil` | perfil e desafios |

`ProtectedRoute` impede abrir as rotas internas antes de concluir o onboarding. As rotas de Contas e Patrimônio não existem.

## Pontos centrais do código

- `useStore.ts` é a fonte única de mutações. Cada ação atualiza o estado e agenda persistência.
- `db.ts` isola IndexedDB e solicita armazenamento persistente quando o navegador oferece suporte.
- `forecast.ts` calcula ocorrências mensais e pagamentos de compromissos.
- `progress.ts` valida missões e desafios antes de permitir XP.
- `profiles.ts` define menu e capacidades por perfil.
- `Layout.tsx` e `BottomNav.tsx` aplicam o modo mobile ou dashboard conforme a largura da tela.
