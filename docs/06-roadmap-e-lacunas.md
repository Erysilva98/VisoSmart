# Roadmap e lacunas

## Próximas evoluções recomendadas

1. Testes unitários para previsão recorrente, limites de orçamento, XP e seleção sem repetição de desafios.
2. Testes de interface nos fluxos de pagar previsão, criar orçamento e uso offline.
3. Separar o store em domínios de transações, previsões, orçamento e aprendizado.
4. Criar migrações versionadas para o estado IndexedDB.
5. Adicionar exportação de dados locais e restauração por arquivo.
6. Implementar autenticação e sincronização somente se o produto passar a exigir múltiplos dispositivos.
7. Revisar acessibilidade por teclado, leitor de tela e contraste.

## Limites atuais

- Não há sincronização em nuvem, integração bancária ou login.
- O estado permanece no dispositivo instalado.
- Contas, transferências e patrimônio foram removidos do escopo.
- A Carteira depende da liberação do perfil e deve evoluir de forma independente do antigo módulo de patrimônio.
