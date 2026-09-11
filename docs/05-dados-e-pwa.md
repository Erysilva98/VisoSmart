# Dados locais e PWA

## Persistência

`AppState` contém onboarding, transações, metas, orçamentos, previsões, cartões de crédito, desafios, aulas concluídas, XP e preferências de cards. Os dados são gravados em IndexedDB na base `finedu-wallet`, store `appstate`, chave `main`.

O app solicita persistência de armazenamento ao navegador. Isso reduz o risco de remoção automática dos dados, mas o usuário ainda pode apagar os dados do aplicativo pelo sistema operacional ou navegador.

## Uso offline

O Workbox pré-armazena HTML, JavaScript, CSS, imagens e fontes produzidos na build. Após a primeira carga com conexão, o PWA abre offline e usa o estado salvo no dispositivo. Não depende de API, servidor ou sincronização externa.

## Build e publicação

```bash
npm run build
```

O comando gera `dist/`, incluindo manifesto e Service Worker. O workflow de GitHub Pages deve publicar essa pasta. Para criar APK com PWABuilder, use a URL pública já publicada e teste a instalação em modo avião após a primeira abertura.
