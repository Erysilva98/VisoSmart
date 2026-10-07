# Viso Smart — identidade e PWA

A marca usa o símbolo de olho com seta, azul profundo `#102A5C`, azul Viso `#426BFF`, lilás `#7C6BFF`, azul claro `#6EC5FF`, verde `#19B36B` e vermelho `#F04D4D`. Títulos usam Sora; interface e textos usam Inter. Tons mais escuros de verde e vermelho permanecem nos textos para legibilidade.

O símbolo editável está em `public/brand/viso-smart-icon.svg`; o componente da interface é `src/components/journey/VisoMark.tsx`. Os PNGs de instalação têm 192 e 512 px; o ícone adaptável de 512 px mantém o símbolo dentro da área segura. Também há favicon e Apple Touch Icon de 180 px.

## Build e PWABuilder

1. Execute `npm run typecheck`, `npm run lint` e `npm run build`.
2. Publique o conteúdo de `dist` no GitHub Pages existente: `https://erysilva98.github.io/TCC/`.
3. Confira `/TCC/manifest.json`, os ícones e `/TCC/sw.js` no endereço publicado.
4. Informe a URL pública no PWABuilder e revise o diagnóstico antes de gerar o pacote Android ou Windows.

O manifest é gerado por `vite.config.ts`; não edite manualmente o arquivo em `dist`. Os caminhos relativos, `id`, `scope` e `start_url` foram mantidos para instalação no subdiretório `/TCC/`. O banco IndexedDB e seus identificadores foram preservados: a mudança de marca não migra nem apaga registros.

As capturas do manifest mostram dados de demonstração. Os arquivos antigos `brand/nexo-*` ficam fora do precache e não são referenciados pela interface nem pelo novo manifest.

O build local não publica o site nem gera um APK/MSIX. A validação do serviço PWABuilder depende da versão efetivamente publicada via HTTPS. Referência: [orientações da Microsoft para PWAs](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/pwa/turn-your-website-pwa).
