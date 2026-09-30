# Diagnóstico do PWABuilder

O relatório apresentado aponta melhorias de metadados e de publicação; não significa que seja necessário ativar toda API que o PWABuilder lista.

## Ajustes aplicados

- O manifesto agora inclui screenshots atuais, com imagens separadas para celular e desktop. O screenshot antigo do FinEdu Wallet foi substituído. As imagens usam dados fictícios de demonstração.
- O workflow do GitHub Pages filtrava o branch `main]`. Corrigi para `main` e adicionei lint, checagem TypeScript e conferência dos artefatos publicados. Sem a correção do filtro, alterações no branch `main` poderiam não publicar o manifesto e o service worker novos.
- O projeto gera `dist/manifest.json` e `dist/sw.js`, e registra o worker no código de entrada. O Workbox pré-armazena arquivos da aplicação e usa `index.html` como fallback de navegação; screenshots de divulgação não ocupam o cache offline.

## O que fazer após publicar

O PWABuilder analisou o endereço publicado, que pode estar atrás do código local. Depois de o workflow publicar o branch `main` em HTTPS, rode a análise de novo. Confira se `manifest.json`, `sw.js`, screenshots e ícones respondem no mesmo caminho do PWA. O service worker precisa ser servido em contexto seguro, normalmente HTTPS.

Se o worker continuar ausente após a nova publicação, verifique no navegador a aba Application/Service Workers: registro, escopo, erros de instalação e a resposta de `sw.js`. Para GitHub Pages em subcaminho, preserve `base: './'` e o `scope` relativo do manifesto.

## Recomendações opcionais que não devem ser preenchidas artificialmente

- `related_applications`: informe só se houver aplicativo nativo oficial para vincular.
- `iarc_rating_id`: use o identificador emitido por um processo real de classificação. Não invente um ID.
- `file_handlers`: só depois de o Nexo implementar e validar a abertura de um tipo de arquivo compatível.
- `share_target`: só quando existir um fluxo claro de recebimento e consentimento para conteúdo compartilhado, que pode incluir dados financeiros pessoais.
- Manipuladores de protocolo, sincronização em segundo plano e periódica, notificações push, widgets, painel lateral Edge, app de anotações e interface com abas dependem de casos de uso e suporte de plataforma que o Nexo atualmente não oferece. Mantê-los desligados evita permissões e comportamentos que não ajudam a gestão financeira local.

O membro `screenshots` do manifesto serve para mostrar a interface em experiências de instalação/distribuição, e as propriedades `wide`/`narrow` identificam os formatos de tela.[Manifest screenshots (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/screenshots) Service workers exigem contexto seguro, geralmente HTTPS, para funcionarem em sites publicados.[Service Worker API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Validação local

`npm run lint`, `npm run typecheck` e `npm run build` passaram. A compilação contém screenshots, manifesto, ícones e `sw.js`; a entrada compilada registra o service worker.
