# Auditoria visual NYX

Revisão da interface para jovens de 12 a 18 anos, considerando o manual de marca NYX e a auditoria heurística fornecida. O escopo é cor, hierarquia, tipografia, sombras e estados visuais; os fluxos financeiros e a estrutura dos cards permanecem iguais.

| Achado | Impacto | Ajuste aplicado |
|---|---|---|
| Muitas superfícies em azul claro | Saldo, aprendizado e controles disputavam atenção | Superfícies comuns brancas; seleção em lilás; azul noturno reservado ao saldo e índigo às ações |
| Verde e vermelho da marca usados em texto pequeno sobre branco | Contraste calculado de 2,70:1 e 3,58:1 | Texto de entrada `#0B784B` (5,52:1) e de gasto `#C92E3A` (5,34:1); tons vivos permanecem nos acentos |
| Cards com pouco relevo | Separação fraca do fundo em telas pequenas | Bordas neutras e sombras leves com base azul noturno; card da trilha com destaque roxo |
| Ícones e rótulos finos | Navegação difícil de reconhecer rapidamente | Traço de ícones de 2 px e rótulos principais de 12 px na Home e na navegação |
| Ação principal pouco distinta | Usuário demora a encontrar onde tocar | Gradiente NYX mantido nos botões principais e botão flutuante; estados ativos mais visíveis |

Os contrastes acima foram calculados para texto sobre branco. Não substituem inspeção em navegador, zoom de 200%, leitor de tela ou testes de compreensão com jovens. Validar a primeira viewport em 320×667 e 390×844, além dos estados de foco, erro, valor oculto e categorias personalizadas.
